'use client'

import dynamic from 'next/dynamic'

const Flipbook = dynamic(() => import('./flipbook'), {
  ssr: false,
  loading: () => (
    <div className="min-h-96 animate-pulse rounded-2xl bg-secondary" aria-label="Memuat buku" />
  ),
})

export function FlipbookLoader(props: { readingId: number; title: string }) {
  return <Flipbook {...props} />
}
