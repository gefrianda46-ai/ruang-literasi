import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ReadingForm } from '@/components/dosen/reading-form'
import { Button } from '@/components/ui/button'

export default function TambahPage() {
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/dosen" />}>
        <ArrowLeft /> Beranda dosen
      </Button>
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Tambah Teks dan Tugas</h1>
        <p className="mt-2 text-muted-foreground">
          Unggah bacaan PDF, lalu susun pertanyaan berpikir kritis beserta kata kunci penilaiannya.
        </p>
      </div>
      <ReadingForm />
    </div>
  )
}
