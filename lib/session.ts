import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type Role = 'dosen' | 'mahasiswa'

export type AppUser = {
  id: string
  name: string
  username: string
  image: string | null
  role: Role
}

export function homeFor(role: Role) {
  return role === 'dosen' ? '/dosen' : '/mahasiswa'
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as typeof session.user & {
    role?: string
    username?: string | null
    displayUsername?: string | null
  }
  return {
    id: u.id,
    name: u.name,
    username: u.displayUsername ?? u.username ?? '',
    image: u.image ?? null,
    role: u.role === 'dosen' ? 'dosen' : 'mahasiswa',
  }
}

export async function requireUser(role?: Role): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  if (role && user.role !== role) redirect(homeFor(user.role))
  return user
}
