import { useAuth0 } from '@auth0/auth0-react'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Globe, Loader2, Upload } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
  fetchUploadTemplate,
  scrapeListings,
  uploadDataset,
  type ScrapeResponse,
  type UploadResponse,
  type UploadTemplate,
} from '@/api/client'
import { getUploadTemplateFallback } from '@/data/uploadTemplates'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { auth0Audience } from '@/config'

const DATASET_OPTIONS = [{ value: 'properties', label: 'Properties', table: 'properties' }] as const

const SCRAPE_SOURCES = [
  { id: 'nobroker', label: 'NoBroker' },
  { id: 'housing', label: 'Housing.com' },
  { id: 'magicbricks', label: 'MagicBricks' },
  { id: '99acres', label: '99acres' },
] as const

const SCRAPE_CITIES = ['Pune', 'Mumbai', 'Bengaluru'] as const

export function DataUploadPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [datasetType, setDatasetType] = useState<(typeof DATASET_OPTIONS)[number]['value']>('properties')
  const [template, setTemplate] = useState<UploadTemplate | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [scrapeCity, setScrapeCity] = useState<(typeof SCRAPE_CITIES)[number]>('Pune')
  const [scrapeIntent, setScrapeIntent] = useState<'for_sale' | 'for_rent'>('for_sale')
  const [scrapeSources, setScrapeSources] = useState<string[]>(['housing', 'nobroker'])
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTemplate() {
      setLoadingTemplate(true)
      setError(null)

      try {
        const data = await fetchUploadTemplate(datasetType)
        if (!cancelled) {
          setTemplate(data)
        }
      } catch (err) {
        if (!cancelled) {
          const fallback = getUploadTemplateFallback(datasetType)
          if (fallback) {
            setTemplate(fallback)
            setError(null)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load template info')
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingTemplate(false)
        }
      }
    }

    void loadTemplate()
    return () => {
      cancelled = true
    }
  }, [datasetType])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Choose a CSV or Excel file to upload.')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: auth0Audience },
      })
      const response = await uploadDataset(token, selectedFile, datasetType)
      setResult(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      if (message.includes('404') || message.includes('Not Found')) {
        setError('Upload service unavailable. Restart the backend: pip install -r requirements.txt then uvicorn app.main:app --reload --port 8000')
      } else {
        setError(message)
      }
    } finally {
      setUploading(false)
    }
  }

  function toggleScrapeSource(sourceId: string) {
    setScrapeSources((current) =>
      current.includes(sourceId) ? current.filter((id) => id !== sourceId) : [...current, sourceId],
    )
  }

  async function handleScrape() {
    if (scrapeSources.length === 0) {
      setError('Select at least one portal to scrape.')
      return
    }

    setScraping(true)
    setError(null)
    setScrapeResult(null)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: auth0Audience },
      })
      const response = await scrapeListings(token, {
        sources: scrapeSources,
        city: scrapeCity,
        listing_status: scrapeIntent,
        max_results: 20,
      })
      setScrapeResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape failed')
    } finally {
      setScraping(false)
    }
  }

  const selectedDataset = DATASET_OPTIONS.find((option) => option.value === datasetType)

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upload property data</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Import listings from a CSV or Excel file into the database. Existing rows with the same
            source and external ID are updated.
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dataset-type">
                Dataset / table
              </label>
              <select
                id="dataset-type"
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={datasetType}
                onChange={(event) => {
                  setDatasetType(event.target.value as typeof datasetType)
                  setResult(null)
                }}
              >
                {DATASET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} → {option.table}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="data-file">
                File
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  id="data-file"
                  type="file"
                  accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
                  onChange={(event) => {
                    setSelectedFile(event.target.files?.[0] ?? null)
                    setResult(null)
                    setError(null)
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Supported formats: CSV, XLSX (max 10 MB)</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload to data
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Fetch live listings (scraping)</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Compliance-first scraping from NoBroker, Housing.com, MagicBricks, and 99acres. Sites may
            block bots — use CSV upload if no rows are returned. See docs/COMPLIANCE.md.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="scrape-city">
                City
              </label>
              <select
                id="scrape-city"
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={scrapeCity}
                onChange={(event) => setScrapeCity(event.target.value as typeof scrapeCity)}
              >
                {SCRAPE_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="scrape-intent">
                Listing type
              </label>
              <select
                id="scrape-intent"
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={scrapeIntent}
                onChange={(event) => setScrapeIntent(event.target.value as typeof scrapeIntent)}
              >
                <option value="for_sale">Buy / Sale</option>
                <option value="for_rent">Rent</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Portals</p>
            <div className="flex flex-wrap gap-2">
              {SCRAPE_SOURCES.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    scrapeSources.includes(source.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => toggleScrapeSource(source.id)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </div>

          <Button className="mt-4" disabled={scraping} onClick={() => void handleScrape()}>
            {scraping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Fetch live data
              </>
            )}
          </Button>

          {scrapeResult && (
            <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="font-medium">
                Scraped {scrapeResult.rows_inserted} new / {scrapeResult.rows_updated} updated rows
                for {scrapeResult.city}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {scrapeResult.sources.map((source) => (
                  <li key={source.source}>
                    {source.source}: parsed {source.parsed}
                    {source.blocked_by_robots ? ' (blocked by robots.txt)' : ''}
                    {source.errors[0] ? ` — ${source.errors[0]}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Expected columns</h2>
            {selectedDataset && <Badge variant="secondary">{selectedDataset.table}</Badge>}
          </div>

          {loadingTemplate ? (
            <p className="text-sm text-muted-foreground">Loading template…</p>
          ) : template ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {template.columns.map((column) => (
                  <Badge key={column} variant="outline">
                    {column}
                  </Badge>
                ))}
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {template.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Template details unavailable.</p>
          )}
        </Card>

        {result && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Upload result</h2>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">File</dt>
                <dd className="font-medium">{result.filename}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Table</dt>
                <dd className="font-medium">{result.dataset_type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rows read</dt>
                <dd className="font-medium">{result.rows_read}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Inserted</dt>
                <dd className="font-medium text-emerald-600">{result.rows_inserted}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium text-blue-600">{result.rows_updated}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Skipped</dt>
                <dd className="font-medium text-amber-600">{result.rows_skipped}</dd>
              </div>
            </dl>

            {result.errors.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Validation issues ({result.errors.length})
                </p>
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {result.errors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  )
}
