import { GitCompare, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompareContext } from '@/context/CompareContext'
import { MAX_COMPARE_COUNT, MIN_COMPARE_COUNT } from '@/lib/propertyCompare'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CompareSelectionBanner() {
  const {
    compareList,
    compareCount,
    removeFromCompare,
    clearCompare,
    limitMessage,
    clearLimitMessage,
  } = useCompareContext()

  if (compareCount === 0 && !limitMessage) {
    return null
  }

  return (
    <Card className="border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <GitCompare className="h-4 w-4" />
            Compare selection ({compareCount}/{MAX_COMPARE_COUNT})
          </div>
          {limitMessage && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {limitMessage}
              <button type="button" className="ml-2 underline" onClick={clearLimitMessage}>
                Dismiss
              </button>
            </p>
          )}
          {compareCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {compareList.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2 text-xs"
                >
                  <img
                    src={property.imageUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="max-w-[160px] truncate font-medium">{property.title}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${property.title}`}
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-muted"
                    onClick={() => removeFromCompare(property.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Select up to {MAX_COMPARE_COUNT} filtered listings, then open the Compare tab for charts
            and side-by-side details.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {compareCount > 0 && (
            <Button variant="outline" onClick={clearCompare}>
              Clear all
            </Button>
          )}
          <Button asChild disabled={compareCount < MIN_COMPARE_COUNT}>
            <Link to="/compare">
              {compareCount < MIN_COMPARE_COUNT
                ? `Add ${MIN_COMPARE_COUNT - compareCount} more to compare`
                : 'View comparison'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
