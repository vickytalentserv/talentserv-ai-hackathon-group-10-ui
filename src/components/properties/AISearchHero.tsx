import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, MapPin, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ParsedSearchCriteria } from '@/types'
import { getFurnishingLabel, getPropertyTypeLabel } from '@/utils/property-search'

const PLACEHOLDER_PROMPTS = [
  'I want a 2BHK property in Baner area',
  'Show luxury apartments under 1 crore',
  'Looking for furnished flats near Hinjewadi',
  '3 BHK villa in Kharadi with garden',
  'Budget flat under 50 lakh in Wakad',
]

interface AISearchHeroProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (query: string) => void
  isSearching?: boolean
  parsedCriteria?: ParsedSearchCriteria | null
  resultCount?: number
  className?: string
}

export function AISearchHero({
  query,
  onQueryChange,
  onSearch,
  isSearching = false,
  parsedCriteria,
  resultCount,
  className,
}: AISearchHeroProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const cyclePlaceholder = () => {
    setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_PROMPTS.length)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 rounded-2xl" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative rounded-2xl border border-border/60 bg-card/80 p-6 shadow-elevated backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              AI Property Search
            </h2>
            <p className="text-sm text-muted-foreground">
              Describe your dream home in natural language
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              'relative flex items-center gap-2 rounded-xl border bg-background/80 p-2 shadow-soft transition-all duration-300',
              isFocused
                ? 'border-primary/50 ring-2 ring-primary/20 shadow-elevated'
                : 'border-border hover:border-primary/30',
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Wand2 className={cn('h-5 w-5 text-primary', isSearching && 'animate-pulse')} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground/70 sm:text-lg"
              aria-label="AI property search"
            />
            <Button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="shrink-0 gap-2 rounded-lg px-4 sm:px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {PLACEHOLDER_PROMPTS.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                onQueryChange(prompt)
                onSearch(prompt)
              }}
              className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
          <button
            type="button"
            onClick={cyclePlaceholder}
            className="rounded-full px-2 py-1 text-xs text-primary hover:underline"
          >
            More examples
          </button>
        </div>

        <AnimatePresence>
          {parsedCriteria && parsedCriteria.query && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-primary">AI understood your search</p>
                  {resultCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {resultCount} properties found
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedCriteria.localities.map((loc) => (
                    <CriteriaChip key={loc} icon={<MapPin className="h-3 w-3" />} label={loc} />
                  ))}
                  {parsedCriteria.bhk && (
                    <CriteriaChip label={`${parsedCriteria.bhk} BHK`} />
                  )}
                  {parsedCriteria.budgetMax && (
                    <CriteriaChip
                      label={`Under ₹${parsedCriteria.budgetMax >= 1_00_00_000 ? `${parsedCriteria.budgetMax / 1_00_00_000}Cr` : `${parsedCriteria.budgetMax / 1_00_000}L`}`}
                    />
                  )}
                  {parsedCriteria.propertyTypes.map((t) => (
                    <CriteriaChip key={t} label={getPropertyTypeLabel(t)} />
                  ))}
                  {parsedCriteria.furnishing && (
                    <CriteriaChip label={getFurnishingLabel(parsedCriteria.furnishing)} />
                  )}
                  {parsedCriteria.isLuxury && <CriteriaChip label="Luxury" />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CriteriaChip({
  label,
  icon,
}: {
  label: string
  icon?: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-foreground shadow-soft">
      {icon}
      {label}
    </span>
  )
}
