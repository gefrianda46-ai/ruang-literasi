'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SettingsDialog } from '@/components/settings-dialog'
import { UserAvatar } from '@/components/user-avatar'
import { authClient } from '@/lib/auth-client'

type Props = {
  user: { name: string; username: string; image: string | null; role: string }
}

export function UserMenu({ user }: Props) {
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)

  async function signOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu akun"
          className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-sm font-medium outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <UserAvatar name={user.name} image={user.image} className="size-8" />
          <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{user.username} · {user.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings /> Pengaturan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
    </>
  )
}
