import Link from 'next/link'
import { count, desc, eq } from 'drizzle-orm'
import { ArrowRight, FilePlus2, FileText, UsersRound } from 'lucide-react'
import { DeleteReadingButton } from '@/components/dosen/delete-reading-button'
import { SettingsButton } from '@/components/settings-button'
import { UserAvatar } from '@/components/user-avatar'
import { db } from '@/lib/db'
import { reading, submission } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

export default async function DosenHome() {
  const user = await requireUser('dosen')
  const readings = await db
    .select({
      id: reading.id,
      title: reading.title,
      createdAt: reading.createdAt,
      submissions: count(submission.id),
    })
    .from(reading)
    .leftJoin(submission, eq(submission.readingId, reading.id))
    .groupBy(reading.id)
    .orderBy(desc(reading.createdAt))

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <UserAvatar name={user.name} image={user.image} className="size-24 text-3xl ring-4 ring-accent/40" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Beranda dosen</p>
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        <SettingsButton user={user} />
      </section>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Menu utama">
        <Link
          href="/dosen/tambah"
          className="group flex flex-col gap-4 rounded-3xl bg-primary p-8 text-primary-foreground transition-transform hover:-translate-y-1"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <FilePlus2 className="size-7" />
          </span>
          <h2 className="text-3xl font-semibold">Tambah Teks dan Tugas</h2>
          <p className="max-w-sm leading-relaxed text-primary-foreground/80">
            Unggah PDF bacaan dan susun pertanyaan dengan kata kunci penilaian.
          </p>
          <span className="mt-2 inline-flex items-center gap-2 font-semibold">
            Buat baru <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/dosen/nilai"
          className="group flex flex-col gap-4 rounded-3xl bg-accent p-8 text-accent-foreground transition-transform hover:-translate-y-1"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-foreground/10">
            <UsersRound className="size-7" />
          </span>
          <h2 className="text-3xl font-semibold">Nilai Mahasiswa</h2>
          <p className="max-w-sm leading-relaxed text-accent-foreground/80">
            Pantau siapa yang sudah mengerjakan, skor, dan jawaban tiap mahasiswa.
          </p>
          <span className="mt-2 inline-flex items-center gap-2 font-semibold">
            Lihat nilai <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Bacaan yang sudah diunggah</h2>
        {readings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Belum ada bacaan. Mulai dengan menambah teks dan tugas pertama.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {readings.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.createdAt.toLocaleDateString('id-ID', { dateStyle: 'medium' })} · {r.submissions} tugas masuk
                  </p>
                </div>
                <DeleteReadingButton id={r.id} title={r.title} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
