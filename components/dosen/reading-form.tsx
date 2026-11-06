'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CATEGORIES,
  MAX_POINTS_PER_QUESTION,
  MIN_QUESTIONS_PER_CATEGORY,
  type CategoryKey,
} from '@/lib/scoring'

type Draft = { uid: number; prompt: string; keywords: string }

let uidCounter = 0
const blank = (): Draft => ({ uid: ++uidCounter, prompt: '', keywords: '' })

const initial = () => {
  // Reset so server and client render identical initial ids (avoids hydration mismatch).
  uidCounter = 0
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.key, Array.from({ length: MIN_QUESTIONS_PER_CATEGORY }, blank)]),
  ) as Record<CategoryKey, Draft[]>
}

export function ReadingForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [drafts, setDrafts] = useState(initial)
  const [pending, setPending] = useState(false)

  function update(category: CategoryKey, uid: number, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [category]: prev[category].map((d) => (d.uid === uid ? { ...d, ...patch } : d)),
    }))
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file) {
      toast.error('Pilih file PDF bacaan terlebih dahulu.')
      return
    }
    const questions = CATEGORIES.flatMap((c) =>
      drafts[c.key].map((d) => ({ category: c.key, prompt: d.prompt, keywords: d.keywords })),
    )

    const body = new FormData()
    body.set('title', title)
    body.set('description', description)
    body.set('file', file)
    body.set('questions', JSON.stringify(questions))

    setPending(true)
    try {
      const res = await fetch('/api/readings', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Gagal menyimpan bacaan.')
        return
      }
      toast.success('Bacaan dan tugas berhasil ditambahkan.')
      router.push('/dosen')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan jaringan.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Data bacaan</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Judul bacaan</Label>
          <Input id="title" required minLength={3} maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Deskripsi singkat (opsional)</Label>
          <Textarea id="description" rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="file">File PDF (maks. 4 MB)</Label>
          <label
            htmlFor="file"
            className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background p-5 transition-colors hover:border-primary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileUp className="size-6" />
            </span>
            <span className="min-w-0 text-sm">
              <span className="block truncate font-medium">{file ? file.name : 'Klik untuk memilih file PDF'}</span>
              <span className="text-muted-foreground">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Bacaan akan tampil sebagai buku interaktif'}
              </span>
            </span>
            <input
              id="file"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Pertanyaan dan kata kunci</h2>
          <p className="mt-1 text-muted-foreground">
            Minimal {MIN_QUESTIONS_PER_CATEGORY} pertanyaan per kategori. Tiap pertanyaan bernilai maksimal{' '}
            {MAX_POINTS_PER_QUESTION} poin, dibagi rata ke setiap kata kunci yang muncul di jawaban mahasiswa.
          </p>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c.key} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h3 className="text-xl font-semibold text-primary">{c.label}</h3>
              <p className="text-sm text-muted-foreground">{c.hint}</p>
            </div>

            {drafts[c.key].map((d, index) => (
              <div key={d.uid} className="flex flex-col gap-3 rounded-2xl bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Pertanyaan {index + 1}</span>
                  {drafts[c.key].length > MIN_QUESTIONS_PER_CATEGORY ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Hapus pertanyaan ${index + 1} ${c.label}`}
                      onClick={() =>
                        setDrafts((prev) => ({ ...prev, [c.key]: prev[c.key].filter((x) => x.uid !== d.uid) }))
                      }
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`p-${d.uid}`}>Teks pertanyaan</Label>
                  <Textarea
                    id={`p-${d.uid}`}
                    rows={2}
                    required
                    value={d.prompt}
                    onChange={(e) => update(c.key, d.uid, { prompt: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`k-${d.uid}`}>Kata kunci jawaban</Label>
                  <Input
                    id={`k-${d.uid}`}
                    required
                    placeholder="pisahkan dengan koma, contoh: iklim, emisi, energi terbarukan"
                    value={d.keywords}
                    onChange={(e) => update(c.key, d.uid, { keywords: e.target.value })}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => setDrafts((prev) => ({ ...prev, [c.key]: [...prev[c.key], blank()] }))}
            >
              <Plus /> Tambah pertanyaan {c.label}
            </Button>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Simpan bacaan dan tugas
        </Button>
      </div>
    </form>
  )
}
