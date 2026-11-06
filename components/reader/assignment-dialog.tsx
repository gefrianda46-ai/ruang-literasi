'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardPenLine, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { submitAssignment } from '@/app/actions/readings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES, MAX_POINTS_PER_QUESTION } from '@/lib/scoring'

type Question = { id: number; category: string; prompt: string }

export function AssignmentDialog({
  readingId,
  title,
  questions,
}: {
  readingId: number
  title: string
  questions: Question[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const answered = questions.filter((q) => (answers[String(q.id)] ?? '').trim().length > 0).length

  function submit() {
    if (answered < questions.length) {
      toast.error('Jawab semua pertanyaan sebelum mengirim.')
      return
    }
    startTransition(async () => {
      const result = await submitAssignment(readingId, answers)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Tugas terkirim. Nilai Anda: ${result.score}`)
      setOpen(false)
      router.refresh()
    })
  }

  let number = 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="h-12 px-6 text-base" />}>
        <ClipboardPenLine /> Kerjakan Tugas
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <DialogTitle className="font-serif text-xl">Tugas: {title}</DialogTitle>
          <DialogDescription>
            {questions.length} pertanyaan, masing-masing bernilai maksimal {MAX_POINTS_PER_QUESTION} poin.
            Jawab dengan kalimat Anda sendiri; nilai dihitung dari kesesuaian dengan kata kunci dosen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-8">
            {CATEGORIES.map((category) => {
              const items = questions.filter((q) => q.category === category.key)
              if (items.length === 0) return null
              return (
                <section key={category.key} className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">{category.hint}</p>
                  </div>
                  {items.map((q) => {
                    number += 1
                    const fieldId = `answer-${q.id}`
                    return (
                      <div key={q.id} className="flex flex-col gap-2">
                        <Label htmlFor={fieldId} className="text-sm leading-relaxed font-medium">
                          {number}. {q.prompt}
                        </Label>
                        <Textarea
                          id={fieldId}
                          rows={4}
                          maxLength={5000}
                          placeholder="Tulis jawaban Anda di sini..."
                          value={answers[String(q.id)] ?? ''}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [String(q.id)]: e.target.value }))
                          }
                        />
                      </div>
                    )
                  })}
                </section>
              )
            })}
          </div>
        </div>

        <DialogFooter className="m-0 items-center rounded-none sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Terjawab {answered} dari {questions.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Tutup
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Send />} Kirim Tugas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
