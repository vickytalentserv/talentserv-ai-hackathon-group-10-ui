import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { parseRequirement, saveRequirement, type ParsedRequirement } from '@/api/client'
import { auth0Audience } from '@/config'
import { EXAMPLE_PROMPTS } from '@/data/mockProperties'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ParsedFiltersPanel } from '@/components/requirements/ParsedFiltersPanel'

interface AISearchSectionProps {
  initialText?: string
  onSearch: (parsed: ParsedRequirement) => void
}

export function AISearchSection({ initialText = '', onSearch }: AISearchSectionProps) {
  const { getAccessTokenSilently } = useAuth0()
  const [text, setText] = useState(initialText)
  const [parsed, setParsed] = useState<ParsedRequirement | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (initialText) {
      setText(initialText)
    }
  }, [initialText])

  async function handleSearch() {
    if (!text.trim()) {
      setError('Describe what you are looking for in natural language.')
      return
    }

    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const result = await parseRequirement(text.trim())
      setParsed(result)
      onSearch(result)

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: auth0Audience },
        })
        await saveRequirement(token, text.trim(), result)
        setSaved(true)
      } catch {
        // Search still works without save when auth token fails
      }
    } catch (err) {
      setParsed(null)
      setError(err instanceof Error ? err.message : 'Failed to parse your search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-accent/30 p-6 shadow-lg sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative space-y-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Property Search
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Find your perfect property with natural language
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Describe budget, BHK, location, furnishing, and intent — we parse it into smart filters
            instantly.
          </p>
        </div>

        <motion.div
          animate={{ scale: focused ? 1.01 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative"
        >
          <div
            className={`flex flex-col gap-3 rounded-2xl border bg-card/90 p-3 shadow-md backdrop-blur transition-colors sm:flex-row sm:items-center ${
              focused ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'
            }`}
          >
            <div className="flex flex-1 items-start gap-3 px-2 py-1">
              <Search className="mt-2.5 h-5 w-5 shrink-0 text-primary" />
              <textarea
                rows={2}
                value={text}
                placeholder='Try "I want a 2BHK property in Baner area" or "Show luxury apartments under 1 crore"'
                className="min-h-[56px] w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void handleSearch()
                  }
                }}
              />
            </div>
            <Button size="lg" disabled={loading} className="shrink-0 sm:px-8" onClick={() => void handleSearch()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 4).map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setText(prompt)
                setParsed(null)
                setSaved(false)
                setError(null)
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {parsed && <ParsedFiltersPanel parsed={parsed} saved={saved} />}
      </div>
    </section>
  )
}
