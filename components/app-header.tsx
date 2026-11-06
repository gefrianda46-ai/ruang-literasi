import Link from 'next/link'
import { BookOpenText } from 'lucide-react'
import { UserMenu } from '@/components/user-menu'
import { homeFor, type AppUser } from '@/lib/session'

const NAV = {
  mahasiswa: [
    { href: '/mahasiswa/bacaan', label: 'Membaca Teks' },
    { href: '/mahasiswa/nilai', label: 'Nilai Tugas' },
  ],
  dosen: [
    { href: '/dosen/tambah', label: 'Tambah Teks' },
    { href: '/dosen/nilai', label: 'Nilai Mahasiswa' },
  ],
} as const

export function AppHeader({ user }: { user: AppUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={homeFor(user.role)} className="flex items-center gap-2 font-serif text-lg font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText className="size-4" />
            </span>
            Literasi Kritis
          </Link>
          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            {NAV[user.role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
