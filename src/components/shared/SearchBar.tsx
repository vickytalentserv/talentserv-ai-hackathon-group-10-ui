import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export function SearchBar({
  className,
  containerClassName,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn('h-9 pl-9', className)}
        {...props}
      />
    </div>
  )
}
