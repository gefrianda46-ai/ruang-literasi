import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { ScoreBadge } from '@/components/score-badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { answer, question, reading, submission } from '@/lib/db/schema'
import { CATEGORIES, MAX_POINTS_PER_QUESTION } from '@/lib/scoring'
import { requireUser } from '@/lib/session'

export default async function NilaiPage() {
  const user = await requireUser('mahasiswa')

  const subs = await db
    .select({
      id: submission.id,
      score: submission.score,
      totalPoints: submission.totalPoints,
      maxPoints: submission.maxPoints,
      createdAt: submission.createdAt,
      readingId: reading.id,
      title: reading.title,
    })
    .from(submission)
    .innerJoin(reading, eq(reading.id, submission.readingId))
    .where(eq(submission.userId, user.id))
    .orderBy(desc(submission.createdAt))

  const rows = await db
    .select({
      submissionId: answer.submissionId,
      category: question.category,
      points: answer.points,
    })
    .from(answer)
    .innerJoin(submission, eq(submission.id, answer.submissionId))
    .innerJoin(question, eq(question.id, answer.questionId))
    .where(eq(submission.userId, user.id))

  const breakdown = new Map<number, Map<string, { points: number; max: number }>>()
  for (const row of rows) {
    const perSub = breakdown.get(row.submissionId) ?? new Map()
    const cat = perSub.get(row.category) ?? { points: 0, max: 0 }
    cat.points += Number(row.points)
    cat.max += MAX_POINTS_PER_QUESTION
    perSub.set(row.category, cat)
    breakdown.set(row.submissionId, perSub)
  }

  const average = subs.length
    ? subs.reduce((sum, s) => sum + Number(s.score), 0) / subs.length
    : 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Nilai Tugas</h1>
          <p className="mt-2 text-muted-foreground">
            Skor dihitung dari kecocokan jawaban dengan kata kunci dosen (0-100).
          </p>
        </div>
        {subs.length ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3">
            <span className="text-sm text-muted-foreground">Rata-rata</span>
            <ScoreBadge score={average} />
          </div>
        ) : null}
      </div>

      {subs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Belum ada tugas yang dikirim.</p>
          <Button nativeButton={false} render={<Link href="/mahasiswa/bacaan" />}>Mulai membaca</Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {subs.map((s) => {
            const perCat = breakdown.get(s.id)
            return (
              <li key={s.id} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold">{s.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Dikirim {s.createdAt.toLocaleDateString('id-ID', { dateStyle: 'long' })} ·{' '}
                      {Number(s.totalPoints)} dari {s.maxPoints} poin
                    </p>
                  </div>
                  <ScoreBadge score={Number(s.score)} className="px-4 py-1.5 text-lg" />
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {CATEGORIES.map((c) => {
                    const v = perCat?.get(c.key)
                    const pct = v && v.max ? (v.points / v.max) * 100 : 0
                    return (
                      <div key={c.key} className="flex flex-col gap-1.5">
                        <dt className="text-sm font-medium">{c.label}</dt>
                        <dd className="flex flex-col gap-1.5">
                          <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {v ? `${Math.round(v.points * 10) / 10} / ${v.max}` : '-'}
                          </span>
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
