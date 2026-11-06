import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { BookMarked, CheckCircle2 } from 'lucide-react'
import { ScoreBadge } from '@/components/score-badge'
import { db } from '@/lib/db'
import { reading, submission } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

export default async function BacaanListPage() {
  const user = await requireUser('mahasiswa')
  const [readings, mine] = await Promise.all([
    db.select().from(reading).orderBy(desc(reading.createdAt)),
    db.select().from(submission).where(eq(submission.userId, user.id)),
  ])
  const byReading = new Map(mine.map((s) => [s.readingId, s]))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Membaca Teks</h1>
        <p className="mt-2 text-muted-foreground">Pilih bacaan untuk dibuka sebagai buku.</p>
      </div>

      {readings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Belum ada bacaan dari dosen. Silakan kembali lagi nanti.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((item) => {
            const sub = byReading.get(item.id)
            return (
              <li key={item.id}>
                <Link
                  href={`/mahasiswa/bacaan/${item.id}`}
                  className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookMarked className="size-6" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <h2 className="font-serif text-xl font-semibold text-balance">{item.title}</h2>
                    {item.description ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.createdAt.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                    {sub ? (
                      <span className="flex items-center gap-2 font-medium text-emerald-700">
                        <CheckCircle2 className="size-4" /> Selesai
                        <ScoreBadge score={Number(sub.score)} />
                      </span>
                    ) : (
                      <span className="font-medium text-accent-foreground">Belum dikerjakan</span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
