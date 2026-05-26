import { GitCompare, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompareContext } from '@/context/CompareContext'
import { MAX_COMPARE_COUNT, MIN_COMPARE_COUNT } from '@/lib/propertyCompare'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function CompareSelectionBanner() {
  const { compareList, compareCount, removeFromCompare, clearCompare, limitMessage, clearLimitMessage } =
    useCompareContext()

  if (compareCount === 0 && !limitMessage) return null

  return (
    <Card className="border-primary/20 bg-accent/50 shadow-soft">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <GitCompare className="h-4 w-4" />
              Compare ({compareCount}/{MAX_COMPARE_COUNT})
            </div>
            {limitMessage && (
              <p className="text-sm text-accent-foreground">
                {limitMessage}
                <button type="button" className="ml-2 font-medium underline" onClick={clearLimitMessage}>
                  Dismiss
                </button>
              </p>
            )}
            {compareCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {compareList.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 text-xs shadow-soft"
                  >
                    <img src={property.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="max-w-[140px] truncate font-medium">{property.title}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${property.title}`}
                      className="rounded-full p-0.5 hover:bg-muted"
                      onClick={() => removeFromCompare(property.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {compareCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompare}>
                Clear
              </Button>
            )}
            <Button asChild size="sm" disabled={compareCount < MIN_COMPARE_COUNT}>
              <Link to="/compare">
                {compareCount < MIN_COMPARE_COUNT
                  ? `Add ${MIN_COMPARE_COUNT - compareCount} more`
                  : 'View comparison'}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
