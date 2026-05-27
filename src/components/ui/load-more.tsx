import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function LoadMoreButton({ loading, hasMore, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore) {
    return null
  }

  return (
    <div className="flex justify-center pt-2">
      <Button variant="outline" disabled={loading} onClick={onLoadMore}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more…
          </>
        ) : (
          'Load more properties'
        )}
      </Button>
    </div>
  )
}
