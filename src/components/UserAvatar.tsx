import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials, isLikelyBrokenPictureUrl } from '../utils/profile'

interface UserAvatarProps {
  name: string
  pictureUrl?: string | null
}

export function UserAvatar({ name, pictureUrl }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(pictureUrl) && !isLikelyBrokenPictureUrl(pictureUrl) && !imageFailed

  if (showImage && pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        className="h-9 w-9 rounded-full border border-border object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-accent text-xs font-semibold text-accent-foreground',
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
