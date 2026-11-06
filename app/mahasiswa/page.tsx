import Link from 'next/link'
import { count, eq } from 'drizzle-orm'
import { ArrowRight, BookOpenText, Trophy } from 'lucide-react'
import { SettingsButton } from '@/components/settings-button'
import { UserAvatar } from '@/components/user-avatar'
import { db } from '@/lib/db'
import { reading, submission } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

export default async function MahasiswaHome() {
  const user = await requireUser('mahasiswa')
  const [[totalReadings], [done]] = await Promise.all([
    db.select({ value: count() }).from(reading),
    db.select({ value: count() }).from(submission).where(eq(submission.userId, user.id)),
  ])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <UserAvatar name={user.name} image={user.image} className="size-28 text-3xl ring-4 ring-accent/40" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Selamat datang,</p>
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username} · Mahasiswa</p>
          <p className="mt-2 text-sm">
            Tugas selesai <span className="font-semibold">{done.value}</span> dari{' '}
            <span className="font-semibold">{totalReadings.value}</span> bacaan.
          </p>
        </div>
        <SettingsButton user={user} />
      </section>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Menu utama">
        <Link
          href="/mahasiswa/bacaan"
          className="group flex flex-col gap-4 rounded-3xl bg-primary p-8 text-primary-foreground transition-transform hover:-translate-y-1"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <BookOpenText className="size-7" />
          </span>
          <h2 className="text-3xl font-semibold">Membaca Teks</h2>
          <p className="max-w-sm leading-relaxed text-primary-foreground/80">
            Buka bacaan dari dosen sebagai buku interaktif, lalu kerjakan tugasnya.
          </p>
          <span className="mt-2 inline-flex items-center gap-2 font-semibold">
            Mulai membaca <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/mahasiswa/nilai"
          className="group flex flex-col gap-4 rounded-3xl bg-accent p-8 text-accent-foreground transition-transform hover:-translate-y-1"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-foreground/10">
            <Trophy className="size-7" />
          </span>
          <h2 className="text-3xl font-semibold">Nilai Tugas</h2>
          <p className="max-w-sm leading-relaxed text-accent-foreground/80">
            Lihat skor dan rincian nilai tiap kategori berpikir kritis.
          </p>
          <span className="mt-2 inline-flex items-center gap-2 font-semibold">
            Lihat nilai <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </div>
  )
}
