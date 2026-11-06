import { timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const username = String(body.username ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const role = body.role === 'dosen' ? 'dosen' : 'mahasiswa'
  const accessCode = String(body.accessCode ?? '')

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Nama lengkap harus 2-80 karakter.' }, { status: 400 })
  }
  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: 'Username 3-30 karakter: huruf kecil, angka, titik, atau garis bawah.' },
      { status: 400 },
    )
  }
  if (password.length < 6 || password.length > 100) {
    return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 400 })
  }

  if (role === 'dosen') {
    const expected = process.env.DOSEN_ACCESS_CODE
    if (!expected) {
      return NextResponse.json(
        { error: 'Pendaftaran dosen belum diaktifkan. Hubungi administrator.' },
        { status: 503 },
      )
    }
    if (!safeEqual(accessCode, expected)) {
      return NextResponse.json({ error: 'Kode akses dosen tidak sesuai.' }, { status: 403 })
    }
  }

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email: `${username}@mail.literasi.app`,
        password,
        username,
      },
    })
    if (role === 'dosen') {
      await db.update(user).set({ role: 'dosen' }).where(eq(user.id, result.user.id))
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const code = (error as { body?: { code?: string } })?.body?.code ?? ''
    if (code.includes('USERNAME') || code.includes('USER_ALREADY_EXISTS')) {
      return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Pendaftaran gagal. Coba lagi.' }, { status: 500 })
  }
}
