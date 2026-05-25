import { formatPrice } from '@/lib/utils'
import type { PropertyListing } from '@/types/property'

export const MIN_COMPARE_COUNT = 2
export const MAX_COMPARE_COUNT = 4

const SOURCE_LABELS: Record<string, string> = {
  housing: 'Housing.com',
  magicbricks: 'MagicBricks',
  nobroker: 'NoBroker',
  '99acres': '99acres',
}

export const COMPARE_CHART_COLORS = [
  'hsl(173 80% 32%)',
  'hsl(221 83% 53%)',
  'hsl(32 95% 44%)',
  'hsl(280 65% 50%)',
]

export interface CompareChartPoint {
  name: string
  value: number
  fill: string
  propertyId: string
}

export interface CompareAttributeRow {
  label: string
  values: string[]
  hint?: string
}

export function formatBuilderSource(source: string): string {
  const key = source.toLowerCase().trim()
  return SOURCE_LABELS[key] ?? source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function shortPropertyName(property: PropertyListing, index: number): string {
  const fromTitle = property.title.split(' ').slice(0, 3).join(' ')
  if (fromTitle.length <= 22) {
    return fromTitle
  }
  return `Property ${String.fromCharCode(65 + index)}`
}

function pricePerSqft(property: PropertyListing): number {
  return property.sqft > 0 ? property.price / property.sqft : 0
}

function formatListingPrice(property: PropertyListing): string {
  const base = formatPrice(property.price, property.currency)
  return property.listingStatus === 'rent' ? `${base}/mo` : base
}

export function buildPriceChartData(properties: PropertyListing[]): CompareChartPoint[] {
  return properties.map((property, index) => ({
    name: shortPropertyName(property, index),
    value: property.price,
    fill: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
    propertyId: property.id,
  }))
}

export function buildSqftChartData(properties: PropertyListing[]): CompareChartPoint[] {
  return properties.map((property, index) => ({
    name: shortPropertyName(property, index),
    value: property.sqft,
    fill: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
    propertyId: property.id,
  }))
}

export function buildRatingChartData(properties: PropertyListing[]): CompareChartPoint[] {
  return properties.map((property, index) => ({
    name: shortPropertyName(property, index),
    value: property.rating,
    fill: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
    propertyId: property.id,
  }))
}

export function buildPricePerSqftChartData(properties: PropertyListing[]): CompareChartPoint[] {
  return properties.map((property, index) => ({
    name: shortPropertyName(property, index),
    value: Math.round(pricePerSqft(property)),
    fill: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
    propertyId: property.id,
  }))
}

export function buildBhkChartData(properties: PropertyListing[]): CompareChartPoint[] {
  return properties.map((property, index) => ({
    name: shortPropertyName(property, index),
    value: property.bedrooms,
    fill: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
    propertyId: property.id,
  }))
}

export function buildRadarChartData(properties: PropertyListing[]) {
  const maxPrice = Math.max(...properties.map((p) => p.price), 1)
  const maxSqft = Math.max(...properties.map((p) => p.sqft), 1)

  const metrics: { metric: string; score: (property: PropertyListing) => number }[] = [
    { metric: 'Price value', score: (property) => Math.round((1 - property.price / maxPrice) * 100) },
    { metric: 'Area', score: (property) => Math.round((property.sqft / maxSqft) * 100) },
    { metric: 'Rating', score: (property) => Math.round((property.rating / 5) * 100) },
    { metric: 'BHK', score: (property) => Math.round((property.bedrooms / 5) * 100) },
    { metric: 'Amenities', score: (property) => Math.round((property.amenities.length / 6) * 100) },
  ]

  return metrics.map(({ metric, score }) => {
    const point: Record<string, string | number> = { metric }
    properties.forEach((property, index) => {
      point[shortPropertyName(property, index)] = score(property)
    })
    return point
  })
}

export function buildMultiCompareRows(properties: PropertyListing[]): CompareAttributeRow[] {
  return [
    {
      label: 'Price',
      values: properties.map(formatListingPrice),
      hint: 'Compare listings with the same buy/rent intent',
    },
    {
      label: 'Price per sqft',
      values: properties.map((property) => {
        const ppsf = pricePerSqft(property)
        return ppsf > 0 ? formatPrice(ppsf, property.currency) : '—'
      }),
    },
    {
      label: 'Locality',
      values: properties.map((property) => property.locality ?? property.location),
    },
    {
      label: 'City',
      values: properties.map((property) => property.city),
    },
    {
      label: 'Builder / Source',
      values: properties.map((property) => formatBuilderSource(property.source)),
    },
    {
      label: 'Property type',
      values: properties.map((property) => property.propertyType),
    },
    {
      label: 'BHK',
      values: properties.map((property) => `${property.bedrooms} BHK`),
    },
    {
      label: 'Bathrooms',
      values: properties.map((property) => String(property.bathrooms)),
    },
    {
      label: 'Area',
      values: properties.map((property) => `${property.sqft.toLocaleString()} sqft`),
    },
    {
      label: 'Furnishing',
      values: properties.map((property) => property.furnishing),
    },
    {
      label: 'Listing intent',
      values: properties.map((property) => (property.listingStatus === 'rent' ? 'Rent' : 'Buy')),
    },
    {
      label: 'Rating',
      values: properties.map((property) => property.rating.toFixed(1)),
    },
    {
      label: 'Availability',
      values: properties.map((property) => property.availability),
    },
    {
      label: 'Amenities',
      values: properties.map((property) => property.amenities.join(', ') || '—'),
    },
  ]
}

export function summarizeMultiCompare(properties: PropertyListing[]): string[] {
  if (properties.length < MIN_COMPARE_COUNT) {
    return ['Add at least two properties from the Properties page to start comparing.']
  }

  const cheapest = [...properties].sort((a, b) => a.price - b.price)[0]
  const largest = [...properties].sort((a, b) => b.sqft - a.sqft)[0]
  const topRated = [...properties].sort((a, b) => b.rating - a.rating)[0]
  const bestPpsf = [...properties].sort((a, b) => pricePerSqft(a) - pricePerSqft(b))[0]

  return [
    `${shortPropertyName(cheapest, properties.indexOf(cheapest))} has the lowest listed price.`,
    `${shortPropertyName(largest, properties.indexOf(largest))} offers the largest carpet area.`,
    `${shortPropertyName(topRated, properties.indexOf(topRated))} has the highest rating.`,
    `${shortPropertyName(bestPpsf, properties.indexOf(bestPpsf))} has the best price per sqft.`,
  ]
}
