import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { question, reading } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { CATEGORY_KEYS, MIN_QUESTIONS_PER_CATEGORY, parseKeywords } from '@/lib/scoring'

export const maxDuration = 60

const MAX_FILE_SIZE = 4 * 1024 * 1024

type IncomingQuestion = { category: string; prompt: string; keywords: string }

export async function POST(request: Request) {
  const current = await getCurrentUser()
  if (!current || current.role !== 'dosen') {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file')
  const title = String(form.get('title') ?? '').trim()
  const description = String(form.get('description') ?? '').trim()

  let incoming: IncomingQuestion[] = []
  try {
    incoming = JSON.parse(String(form.get('questions') ?? '[]'))
  } catch {
    return NextResponse.json({ error: 'Data pertanyaan tidak valid.' }, { status: 400 })
  }

  if (title.length < 3 || title.length > 150) {
    return NextResponse.json({ error: 'Judul bacaan harus 3-150 karakter.' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'File PDF bacaan wajib diunggah.' }, { status: 400 })
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'File harus berformat PDF.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Ukuran PDF maksimal 4 MB.' }, { status: 400 })
  }

  const cleaned = incoming
    .map((q) => ({
      category: String(q.category),
      prompt: String(q.prompt ?? '').trim(),
      keywords: parseKeywords(String(q.keywords ?? '')),
    }))
    .filter((q) => CATEGORY_KEYS.includes(q.category as never))

  for (const key of CATEGORY_KEYS) {
    const inCategory = cleaned.filter((q) => q.category === key)
    const valid = inCategory.filter((q) => q.prompt && q.keywords.length > 0)
    if (valid.length < MIN_QUESTIONS_PER_CATEGORY || valid.length !== inCategory.length) {
      return NextResponse.json(
        {
          error: `Kategori ${key} memerlukan minimal ${MIN_QUESTIONS_PER_CATEGORY} pertanyaan, masing-masing dengan kata kunci.`,
        },
        { status: 400 },
      )
    }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const blob = await put(`readings/${Date.now()}-${safeName}`, file, {
    access: 'private',
    contentType: 'application/pdf',
  })

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(reading)
      .values({
        title,
        description: description || null,
        filePath: blob.pathname,
        fileName: file.name,
        createdBy: current.id,
      })
      .returning({ id: reading.id })

    await tx.insert(question).values(
      cleaned.map((q, index) => ({
        readingId: row.id,
        category: q.category,
        prompt: q.prompt,
        keywords: q.keywords,
        position: index,
      })),
    )
    return row
  })

  return NextResponse.json({ id: created.id })
}
