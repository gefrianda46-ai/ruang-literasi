'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/user-avatar'
import { authClient } from '@/lib/auth-client'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { name: string; username: string; image: string | null }
}

const PHOTO_SIZE = 256

function resizeToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = PHOTO_SIZE
      canvas.height = PHOTO_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas tidak tersedia'))
        return
      }
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        PHOTO_SIZE,
        PHOTO_SIZE,
      )
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gambar tidak dapat dibaca'))
    }
    img.src = url
  })
}

export function SettingsDialog({ open, onOpenChange, user }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user.name)
  const [image, setImage] = useState<string | null>(user.image)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pending, startTransition] = useTransition()

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Pilih file gambar (JPG, PNG, atau WebP).')
      return
    }
    try {
      setImage(await resizeToSquare(file))
    } catch {
      toast.error('Foto tidak dapat diproses. Coba gambar lain.')
    }
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(user.name)
      setImage(user.image)
      setCurrentPassword('')
      setNewPassword('')
    }
    onOpenChange(next)
  }

  function save() {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error('Nama minimal 2 karakter.')
      return
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter.')
      return
    }
    if (newPassword && !currentPassword) {
      toast.error('Isi kata sandi saat ini untuk mengganti kata sandi.')
      return
    }

    startTransition(async () => {
      const profile = await authClient.updateUser({ name: trimmed, image })
      if (profile.error) {
        toast.error('Profil gagal disimpan.')
        return
      }
      if (newPassword) {
        const pw = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        })
        if (pw.error) {
          toast.error('Kata sandi saat ini tidak sesuai.')
          return
        }
      }
      toast.success('Pengaturan tersimpan.')
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Pengaturan Akun</DialogTitle>
          <DialogDescription>
            Ubah foto, nama, atau kata sandi Anda. Username tidak dapat diubah.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <UserAvatar name={name || user.name} image={image} className="size-20 text-xl" />
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Unggah foto profil"
                onChange={(e) => {
                  handleFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera /> Ganti foto
              </Button>
              {image ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setImage(null)}>
                  <Trash2 /> Hapus foto
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-name">Nama lengkap</Label>
            <Input
              id="settings-name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-username">Username</Label>
            <Input id="settings-username" value={`@${user.username}`} disabled />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Ganti kata sandi (opsional)</p>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Kata sandi saat ini"
              aria-label="Kata sandi saat ini"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Kata sandi baru"
              aria-label="Kata sandi baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Batal
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
