import { useAuth0 } from '@auth0/auth0-react'
import { ArrowRight, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { parseRequirement, saveRequirement, type ParsedRequirement } from '@/api/client'
import { auth0Audience } from '@/config'
import { EXAMPLE_PROMPTS } from '@/data/mockProperties'
import { cn } from '@/lib/utils'

interface AISearchSectionProps {
  initialText?: string
  onSearch: (parsed: ParsedRequirement) => void
}

export function AISearchSection({ initialText = '', onSearch }: AISearchSectionProps) {
  const { getAccessTokenSilently } = useAuth0()
  const [text, setText] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (initialText) setText(initialText)
  }, [initialText])

  async function handleSearch() {
    if (!text.trim()) {
      setError('Describe what you are looking for in natural language.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await parseRequirement(text.trim())
      onSearch(result)
      try {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: auth0Audience } })
        await saveRequirement(token, text.trim(), result)
      } catch {
        /* optional save */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse your search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-highlight/20 shadow-elevated">
      <div className="search-card-gradient px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[hsl(168_55%_38%/0.15)] blur-3xl" />

        <div className="relative flex items-start gap-3.5">
          <div className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-soft">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                AI Property Search
              </h2>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-0.5 text-sm text-white/70">
              Describe your dream home in natural language — we&apos;ll find the best matches.
            </p>
          </div>
        </div>

        <div
          className={cn(
            'search-card-inner relative mt-5 flex h-14 w-full items-center overflow-hidden rounded-full border pl-5 pr-1.5 shadow-elevated transition-all sm:h-[4.25rem]',
            focused
              ? 'border-primary ring-4 ring-primary/20'
              : 'border-white/20 hover:border-primary/40',
          )}
        >
          <Wand2 className="mr-3 hidden h-5 w-5 shrink-0 text-highlight sm:block" />
          <input
            type="text"
            value={text}
            placeholder="I want a 2BHK property in Baner area"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-placeholder sm:text-lg"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleSearch()
              }
            }}
          />
          <button
            type="button"
            disabled={loading}
            className="btn-gradient-primary inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 sm:h-12 sm:px-8 sm:text-base"
            onClick={() => void handleSearch()}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Search
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-white/60">Try:</span>
          {EXAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/20 hover:text-white sm:text-sm"
              onClick={() => {
                setText(prompt)
                setError(null)
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {error && (
          <p className="relative mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
