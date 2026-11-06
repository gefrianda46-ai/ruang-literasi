import Image from 'next/image'
import { redirect } from 'next/navigation'
import { BookOpenText, ClipboardCheck, Layers, Sparkles } from 'lucide-react'
import { LoginDialog } from '@/components/landing/login-dialog'
import { CATEGORIES } from '@/lib/scoring'
import { getCurrentUser, homeFor } from '@/lib/session'

const STEPS = [
  {
    icon: BookOpenText,
    title: 'Baca seperti membuka buku',
    text: 'Teks dari dosen tampil sebagai buku interaktif yang dapat dibalik halaman demi halaman.',
  },
  {
    icon: Layers,
    title: 'Jawab lima ragam berpikir',
    text: 'Interpretasi, analisis, inferensi, evaluasi, dan refleksi, minimal dua pertanyaan per kategori.',
  },
  {
    icon: ClipboardCheck,
    title: 'Nilai keluar otomatis',
    text: 'Jawaban dicocokkan dengan kata kunci dosen, lalu skor dan rinciannya langsung tampil.',
  },
]

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) redirect(homeFor(user.role))

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 font-serif text-xl font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenText className="size-5" />
          </span>
          Literasi Kritis
        </div>
        <LoginDialog variant="outline" size="lg" className="h-10 px-5">
          Masuk
        </LoginDialog>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pt-12 lg:pb-24">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              <Sparkles className="size-4 text-accent" />
              Platform literasi untuk perkuliahan
            </span>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Membaca dengan kritis, menjawab dengan percaya diri.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Dosen mengunggah bacaan dan tugas berpikir kritis. Mahasiswa membaca dalam buku
              interaktif, menjawab, dan langsung melihat nilainya.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LoginDialog size="lg" className="h-12 px-7 text-base">
                Mulai sekarang
              </LoginDialog>
              <p className="text-sm text-muted-foreground">Masuk sebagai mahasiswa atau dosen</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] bg-accent/25" aria-hidden="true" />
            <Image
              src="/hero-books.png"
              alt="Tumpukan buku dan buku terbuka dengan cahaya hangat"
              width={1024}
              height={1024}
              priority
              className="aspect-[4/3] w-full rounded-[1.75rem] object-cover shadow-xl ring-1 ring-border"
            />
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex flex-col gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h2 className="text-xl font-semibold">
                  {index + 1}. {step.title}
                </h2>
                <p className="leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="mb-2 text-3xl font-semibold">Lima kategori berpikir kritis</h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Setiap bacaan memiliki pertanyaan dari kelima kategori berikut, dan tiap pertanyaan
            bernilai maksimal 8 poin.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES.map((category, index) => (
              <li
                key={category.key}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
              >
                <span className="font-serif text-3xl font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold">{category.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{category.hint}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Literasi Kritis - ruang belajar membaca, berpikir, dan menjawab.
      </footer>
    </div>
  )
}
