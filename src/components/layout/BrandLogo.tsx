import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { tile: 'h-8 w-8 text-xs', text: 'text-sm' },
  md: { tile: 'h-9 w-9 text-sm', text: 'text-base' },
  lg: { tile: 'h-12 w-12 text-base', text: 'text-lg' },
}

export function BrandLogo({ size = 'md', showText = true, className }: BrandLogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl brand-gradient font-bold text-primary-foreground shadow-soft',
          s.tile,
        )}
      >
        R
      </span>
      {showText && (
        <div className="min-w-0">
          <span className={cn('block font-semibold tracking-tight text-foreground', s.text)}>
            Realist
          </span>
          {size === 'lg' && (
            <span className="block text-xs text-muted-foreground">Property Intelligence</span>
          )}
        </div>
      )}
    </div>
  )
}
