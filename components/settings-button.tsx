'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsDialog } from '@/components/settings-dialog'

export function SettingsButton({
  user,
}: {
  user: { name: string; username: string; image: string | null }
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Settings /> Pengaturan
      </Button>
      <SettingsDialog open={open} onOpenChange={setOpen} user={user} />
    </>
  )
}
