import Link from 'next/link'
import { asc, desc, eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import { SubmissionDetail, type AnswerDetail } from '@/components/dosen/submission-detail'
import { ScoreBadge } from '@/components/score-badge'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { db } from '@/lib/db'
import { answer, question, reading, submission, user } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export default async function DosenNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>
}) {
  await requireUser('dosen')
  const { r } = await searchParams

  const readings = await db
    .select({ id: reading.id, title: reading.title })
    .from(reading)
    .orderBy(desc(reading.createdAt))
  const selected = readings.find((x) => String(x.id) === r) ?? readings[0]

  let rows: {
    id: string
    name: string
    username: string | null
    image: string | null
    score: number | null
    createdAt: Date | null
    answers: AnswerDetail[]
  }[] = []

  if (selected) {
    const [students, subs, answerRows] = await Promise.all([
      db
        .select({ id: user.id, name: user.name, username: user.username, image: user.image })
        .from(user)
        .where(eq(user.role, 'mahasiswa'))
        .orderBy(asc(user.name)),
      db.select().from(submission).where(eq(submission.readingId, selected.id)),
      db
        .select({
          submissionId: answer.submissionId,
          questionId: question.id,
          category: question.category,
          prompt: question.prompt,
          keywords: question.keywords,
          position: question.position,
          answerText: answer.answerText,
          matchedKeywords: answer.matchedKeywords,
          points: answer.points,
        })
        .from(answer)
        .innerJoin(question, eq(question.id, answer.questionId))
        .innerJoin(submission, eq(submission.id, answer.submissionId))
        .where(eq(submission.readingId, selected.id))
        .orderBy(asc(question.position)),
    ])

    const subByUser = new Map(subs.map((s) => [s.userId, s]))
    rows = students.map((s) => {
      const sub = subByUser.get(s.id)
      return {
        ...s,
        score: sub ? Number(sub.score) : null,
        createdAt: sub?.createdAt ?? null,
        answers: sub
          ? answerRows
              .filter((a) => a.submissionId === sub.id)
              .map((a) => ({
                questionId: a.questionId,
                category: a.category,
                prompt: a.prompt,
                keywords: a.keywords,
                answerText: a.answerText,
                matchedKeywords: a.matchedKeywords,
                points: Number(a.points),
              }))
          : [],
      }
    })
  }

  const done = rows.filter((x) => x.score !== null)
  const average = done.length ? done.reduce((sum, x) => sum + (x.score ?? 0), 0) / done.length : 0

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/dosen" />}>
        <ArrowLeft /> Beranda dosen
      </Button>
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Nilai Mahasiswa</h1>
        <p className="mt-2 text-muted-foreground">Pilih bacaan untuk melihat nilai tiap mahasiswa.</p>
      </div>

      {readings.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Belum ada bacaan. Tambahkan teks dan tugas terlebih dahulu.
        </p>
      ) : (
        <>
          <nav aria-label="Pilih bacaan" className="flex flex-wrap gap-2">
            {readings.map((x) => (
              <Link
                key={x.id}
                href={`/dosen/nilai?r=${x.id}`}
                aria-current={x.id === selected.id ? 'page' : undefined}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  x.id === selected.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-secondary',
                )}
              >
                {x.title}
              </Link>
            ))}
          </nav>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Mahasiswa terdaftar" value={rows.length} />
            <Stat label="Sudah mengerjakan" value={done.length} />
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
              <span className="text-sm text-muted-foreground">Rata-rata nilai</span>
              {done.length ? <ScoreBadge score={average} className="w-fit text-lg" /> : <span className="text-2xl font-semibold">-</span>}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead className="text-right">Jawaban</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Belum ada mahasiswa yang mendaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={row.name} image={row.image} className="size-9" />
                          <div>
                            <p className="font-medium">{row.name}</p>
                            <p className="text-xs text-muted-foreground">@{row.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.score !== null ? (
                          <span className="text-emerald-700">
                            Selesai · {row.createdAt?.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Belum mengerjakan</span>
                        )}
                      </TableCell>
                      <TableCell>{row.score !== null ? <ScoreBadge score={row.score} /> : '-'}</TableCell>
                      <TableCell className="text-right">
                        {row.score !== null ? (
                          <SubmissionDetail studentName={row.name} score={row.score} answers={row.answers} />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
    </div>
  )
}
