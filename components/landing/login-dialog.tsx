'use client'

import { useState, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, UserRoundCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authClient } from '@/lib/auth-client'

type Role = 'mahasiswa' | 'dosen'
type Mode = 'masuk' | 'daftar'

export function LoginDialog({
  children,
  ...buttonProps
}: ComponentProps<typeof Button>) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>('mahasiswa')
  const [mode, setMode] = useState<Mode>('masuk')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function reset() {
    setError('')
    setPassword('')
  }

  async function signIn() {
    const result = await authClient.signIn.username({
      username: username.trim().toLowerCase(),
      password,
    })
    if (result.error) {
      const isCredentialError =
        result.error.code === 'INVALID_USERNAME_OR_PASSWORD' ||
        result.error.status === 401
      setError(
        isCredentialError
          ? 'Username atau kata sandi salah.'
          : 'Tidak dapat masuk saat ini. Muat ulang halaman lalu coba lagi.',
      )
      return false
    }
    const session = await authClient.getSession()
    const actual = (session.data?.user as { role?: string } | undefined)?.role
    const actualRole: Role = actual === 'dosen' ? 'dosen' : 'mahasiswa'
    if (actualRole !== role) {
      await authClient.signOut()
      setError(
        role === 'dosen'
          ? 'Akun ini bukan akun dosen. Gunakan tab Mahasiswa.'
          : 'Akun ini adalah akun dosen. Gunakan tab Dosen.',
      )
      return false
    }
    router.push(actualRole === 'dosen' ? '/dosen' : '/mahasiswa')
    router.refresh()
    return true
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'daftar') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, password, role, accessCode }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? 'Pendaftaran gagal.')
          return
        }
      }
      await signIn()
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...buttonProps} />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === 'masuk' ? 'Selamat datang kembali' : 'Buat akun baru'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'masuk'
              ? 'Masuk dengan username dan kata sandi Anda.'
              : 'Daftar untuk mulai membaca dan mengerjakan tugas.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={role}
          onValueChange={(value) => {
            setRole(value as Role)
            reset()
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mahasiswa">
              <GraduationCap /> Mahasiswa
            </TabsTrigger>
            <TabsTrigger value="dosen">
              <UserRoundCog /> Dosen
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {mode === 'daftar' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-name">Nama lengkap</Label>
              <Input
                id="auth-name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="auth-username">Username</Label>
            <Input
              id="auth-username"
              autoComplete="username"
              autoCapitalize="none"
              required
              minLength={3}
              placeholder="contoh: budi.santoso"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="auth-password">Kata sandi</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === 'masuk' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === 'daftar' && role === 'dosen' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-code">Kode akses dosen</Label>
              <Input
                id="auth-code"
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kode ini diberikan oleh administrator program studi.
              </p>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending} className="h-10">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {mode === 'masuk' ? 'Masuk' : 'Daftar dan masuk'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'masuk' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === 'masuk' ? 'daftar' : 'masuk')
              reset()
            }}
          >
            {mode === 'masuk' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
