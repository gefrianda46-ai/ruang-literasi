'use client'

import { Eye } from 'lucide-react'
import { ScoreBadge } from '@/components/score-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { categoryLabel, MAX_POINTS_PER_QUESTION } from '@/lib/scoring'

export type AnswerDetail = {
  questionId: number
  category: string
  prompt: string
  keywords: string[]
  answerText: string
  matchedKeywords: string[]
  points: number
}

export function SubmissionDetail({
  studentName,
  score,
  answers,
}: {
  studentName: string
  score: number
  answers: AnswerDetail[]
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Eye /> Lihat jawaban
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <DialogTitle className="flex items-center gap-3 font-serif text-xl">
            {studentName} <ScoreBadge score={score} />
          </DialogTitle>
          <DialogDescription>Rincian jawaban dan kata kunci yang cocok.</DialogDescription>
        </DialogHeader>
        <ol className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          {answers.map((a, index) => (
            <li key={a.questionId} className="flex flex-col gap-2 rounded-2xl bg-secondary/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">
                  {index + 1}. {a.prompt}
                </p>
                <Badge variant="outline" className="shrink-0">
                  {categoryLabel(a.category)}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{a.answerText}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {a.keywords.map((k) => {
                  const hit = a.matchedKeywords.includes(k)
                  return (
                    <span
                      key={k}
                      className={
                        hit
                          ? 'rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-900'
                          : 'rounded-full bg-muted px-2 py-0.5 text-muted-foreground line-through'
                      }
                    >
                      {k}
                    </span>
                  )
                })}
                <span className="ml-auto font-semibold tabular-nums">
                  {Math.round(a.points * 10) / 10} / {MAX_POINTS_PER_QUESTION}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
