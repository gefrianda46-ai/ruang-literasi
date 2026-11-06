'use client'

import { useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteReading } from '@/app/actions/readings'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteReadingButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Hapus ${title}`} disabled={pending} />
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="text-destructive" />}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus bacaan ini?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{title}&quot; beserta pertanyaan, jawaban, dan nilai mahasiswa akan dihapus
            permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              startTransition(async () => {
                const result = await deleteReading(id)
                if (result.ok) toast.success('Bacaan dihapus.')
                else toast.error(result.error)
              })
            }
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
