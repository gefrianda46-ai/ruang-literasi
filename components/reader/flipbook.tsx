'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageImage = { src: string; width: number; height: number }

const Page = forwardRef<HTMLDivElement, { src: string; number: number }>(function Page(
  { src, number },
  ref,
) {
  return (
    <div ref={ref} className="bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || '/placeholder.svg'}
        alt={`Halaman ${number}`}
        draggable={false}
        className="size-full select-none object-contain"
      />
    </div>
  )
})

export default function Flipbook({ readingId, title }: { readingId: number; title: string }) {
  const [pages, setPages] = useState<PageImage[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(0)
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjs.getDocument({ url: `/api/readings/${readingId}/file` }).promise
        if (cancelled) return
        setProgress({ done: 0, total: pdf.numPages })

        const rendered: PageImage[] = []
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const scale = Math.min(2, 1100 / base.height)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('canvas')
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: context, viewport, canvas }).promise
          rendered.push({
            src: canvas.toDataURL('image/jpeg', 0.88),
            width: viewport.width,
            height: viewport.height,
          })
          if (cancelled) return
          setProgress({ done: n, total: pdf.numPages })
        }
        setPages(rendered)
      } catch (err) {
        console.error('Flipbook error:', err)
        if (!cancelled) setError('Bacaan tidak dapat dimuat. Muat ulang halaman ini.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [readingId])

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
        {error}
      </div>
    )
  }

  if (pages.length === 0) {
    const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="font-medium">Membuka buku...</p>
        <div className="h-2 w-56 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">
          {progress.total ? `Menyiapkan halaman ${progress.done} dari ${progress.total}` : 'Mengunduh bacaan'}
        </p>
      </div>
    )
  }

  const ratio = pages[0].height / pages[0].width
  const baseWidth = 440

  return (
    <div className="flex flex-col items-center gap-5" role="group" aria-label={`Buku ${title}`}>
      <div className="w-full overflow-hidden rounded-2xl bg-secondary/60 px-2 py-6 sm:px-6">
        <div className="mx-auto flex justify-center">
          <HTMLFlipBook
            ref={bookRef as never}
            width={baseWidth}
            height={Math.round(baseWidth * ratio)}
            size="stretch"
            minWidth={260}
            maxWidth={620}
            minHeight={340}
            maxHeight={1000}
            showCover
            maxShadowOpacity={0.4}
            mobileScrollSupport
            drawShadow
            flippingTime={700}
            usePortrait
            startPage={0}
            autoSize
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            startZIndex={0}
            className="shadow-2xl"
            style={{}}
            onFlip={(e: { data: number }) => setCurrent(e.data)}
          >
            {pages.map((p, i) => (
              <Page key={i} src={p.src} number={i + 1} />
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Halaman sebelumnya"
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
        >
          <ChevronLeft />
        </Button>
        <p className="min-w-32 text-center text-sm font-medium tabular-nums" aria-live="polite">
          Halaman {Math.min(current + 1, pages.length)} dari {pages.length}
        </p>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Halaman berikutnya"
          onClick={() => bookRef.current?.pageFlip().flipNext()}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
