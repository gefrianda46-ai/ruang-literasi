import { cn } from '@/lib/utils'

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 75
      ? 'bg-emerald-100 text-emerald-900'
      : score >= 50
        ? 'bg-amber-100 text-amber-900'
        : 'bg-rose-100 text-rose-900'
  return (
    <span
      className={cn(
        'inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold tabular-nums',
        tone,
        className,
      )}
    >
      {Math.round(score * 10) / 10}
    </span>
  )
}
