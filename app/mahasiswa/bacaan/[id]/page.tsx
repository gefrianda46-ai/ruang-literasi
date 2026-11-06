import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AssignmentDialog } from '@/components/reader/assignment-dialog'
import { FlipbookLoader } from '@/components/reader/flipbook-loader'
import { ScoreBadge } from '@/components/score-badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { question, reading, submission } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser('mahasiswa')
  const { id } = await params
  const readingId = Number(id)
  if (!Number.isInteger(readingId)) notFound()

  const [item] = await db.select().from(reading).where(eq(reading.id, readingId))
  if (!item) notFound()

  const [questions, [sub]] = await Promise.all([
    db
      .select({ id: question.id, category: question.category, prompt: question.prompt })
      .from(question)
      .where(eq(question.readingId, readingId))
      .orderBy(asc(question.position)),
    db
      .select()
      .from(submission)
      .where(and(eq(submission.readingId, readingId), eq(submission.userId, user.id))),
  ])

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/mahasiswa/bacaan" />}>
        <ArrowLeft /> Daftar bacaan
      </Button>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl">{item.title}</h1>
          {item.description ? (
            <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
          ) : null}
        </div>
        {sub ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <div className="text-sm">
              <p className="font-medium">Tugas sudah dikirim</p>
              <Link href="/mahasiswa/nilai" className="text-primary underline-offset-4 hover:underline">
                Lihat rincian nilai
              </Link>
            </div>
            <ScoreBadge score={Number(sub.score)} />
          </div>
        ) : (
          <AssignmentDialog readingId={item.id} title={item.title} questions={questions} />
        )}
      </div>

      <FlipbookLoader readingId={item.id} title={item.title} />
    </div>
  )
}
