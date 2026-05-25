import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface PropertyCardSkeletonProps {
  size?: 'default' | 'large'
}

export function PropertyCardSkeleton({ size = 'default' }: PropertyCardSkeletonProps) {
  const isLarge = size === 'large'

  return (
    <Card className="overflow-hidden">
      <Skeleton
        className={
          isLarge
            ? 'aspect-[4/3] min-h-[240px] w-full rounded-none sm:min-h-[320px]'
            : 'aspect-[16/10] w-full rounded-none'
        }
      />
      <div className={isLarge ? 'space-y-4 p-6' : 'space-y-3 p-4'}>
        <Skeleton className={isLarge ? 'h-7 w-4/5' : 'h-5 w-4/5'} />
        <Skeleton className={isLarge ? 'h-5 w-3/5' : 'h-4 w-3/5'} />
        <div className="flex gap-2">
          <Skeleton className={isLarge ? 'h-5 w-20' : 'h-4 w-16'} />
          <Skeleton className={isLarge ? 'h-5 w-20' : 'h-4 w-16'} />
          <Skeleton className={isLarge ? 'h-5 w-24' : 'h-4 w-20'} />
        </div>
        <Skeleton className={isLarge ? 'h-11 w-full' : 'h-9 w-full'} />
      </div>
    </Card>
  )
}
