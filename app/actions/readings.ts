'use server'

import { del } from '@vercel/blob'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { answer, question, reading, submission } from '@/lib/db/schema'
import { MAX_POINTS_PER_QUESTION, scoreAnswer, toScore } from '@/lib/scoring'
import { getCurrentUser } from '@/lib/session'

export async function deleteReading(readingId: number) {
  const current = await getCurrentUser()
  if (!current || current.role !== 'dosen') {
    return { ok: false as const, error: 'Tidak diizinkan.' }
  }

  const [row] = await db.select().from(reading).where(eq(reading.id, readingId))
  if (!row) return { ok: false as const, error: 'Bacaan tidak ditemukan.' }

  await db.transaction(async (tx) => {
    const subs = await tx
      .select({ id: submission.id })
      .from(submission)
      .where(eq(submission.readingId, readingId))
    if (subs.length) {
      await tx.delete(answer).where(
        inArray(
          answer.submissionId,
          subs.map((s) => s.id),
        ),
      )
    }
    await tx.delete(submission).where(eq(submission.readingId, readingId))
    await tx.delete(question).where(eq(question.readingId, readingId))
    await tx.delete(reading).where(eq(reading.id, readingId))
  })

  try {
    await del(row.filePath)
  } catch (error) {
    console.error('Blob delete failed:', error)
  }

  revalidatePath('/dosen')
  revalidatePath('/dosen/nilai')
  return { ok: true as const }
}

export async function submitAssignment(
  readingId: number,
  answers: Record<string, string>,
) {
  const current = await getCurrentUser()
  if (!current || current.role !== 'mahasiswa') {
    return { ok: false as const, error: 'Tidak diizinkan.' }
  }

  const [existing] = await db
    .select({ id: submission.id })
    .from(submission)
    .where(and(eq(submission.readingId, readingId), eq(submission.userId, current.id)))
  if (existing) {
    return { ok: false as const, error: 'Tugas ini sudah pernah dikirim.' }
  }

  const questions = await db
    .select()
    .from(question)
    .where(eq(question.readingId, readingId))
  if (questions.length === 0) {
    return { ok: false as const, error: 'Bacaan tidak ditemukan.' }
  }

  const graded = questions.map((q) => {
    const text = String(answers[String(q.id)] ?? '').slice(0, 5000)
    const { matched, points } = scoreAnswer(text, q.keywords)
    return { questionId: q.id, text, matched, points }
  })

  const totalPoints = graded.reduce((sum, g) => sum + g.points, 0)
  const maxPoints = questions.length * MAX_POINTS_PER_QUESTION
  const score = toScore(totalPoints, maxPoints)

  await db.transaction(async (tx) => {
    const [sub] = await tx
      .insert(submission)
      .values({
        readingId,
        userId: current.id,
        totalPoints: String(totalPoints),
        maxPoints,
        score: String(score),
      })
      .returning({ id: submission.id })

    await tx.insert(answer).values(
      graded.map((g) => ({
        submissionId: sub.id,
        questionId: g.questionId,
        answerText: g.text,
        matchedKeywords: g.matched,
        points: String(g.points),
      })),
    )
  })

  revalidatePath('/mahasiswa')
  revalidatePath('/mahasiswa/bacaan')
  revalidatePath('/mahasiswa/nilai')
  return { ok: true as const, score }
}
