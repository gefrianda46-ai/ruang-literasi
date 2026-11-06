import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string
  image?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn('size-9', className)}>
      {image ? <AvatarImage src={image} alt={`Foto ${name}`} /> : null}
      <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
        {initials(name) || '?'}
      </AvatarFallback>
    </Avatar>
  )
}
