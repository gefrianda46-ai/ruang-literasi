import { AppHeader } from '@/components/app-header'
import { requireUser } from '@/lib/session'

export default async function DosenLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser('dosen')
  return (
    <div className="min-h-dvh">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
