import { get } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { reading } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const current = await getCurrentUser()
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const readingId = Number(id)
  if (!Number.isInteger(readingId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [row] = await db
    .select({ filePath: reading.filePath })
    .from(reading)
    .where(eq(reading.id, readingId))
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await get(row.filePath, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Not found', { status: 404 })

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
    })
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': 'application/pdf',
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
    },
  })
}
