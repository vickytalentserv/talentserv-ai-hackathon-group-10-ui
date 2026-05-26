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
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
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

export type ComparisonMetricIcon = 'value' | 'area' | 'rating' | 'bhk' | 'amenities'

export interface ComparisonMetricValue {
  propertyId: string
  name: string
  displayValue: string
  score: number
  color: string
  isBest: boolean
}

export interface ComparisonMetric {
  id: string
  label: string
  description: string
  icon: ComparisonMetricIcon
  values: ComparisonMetricValue[]
}

export interface PropertyOverallScore {
  propertyId: string
  name: string
  color: string
  score: number
  rank: number
}

function markBestValues(values: ComparisonMetricValue[]): ComparisonMetricValue[] {
  const bestScore = Math.max(...values.map((value) => value.score))
  if (bestScore <= 0) {
    return values
  }

  return values.map((value) => ({
    ...value,
    isBest: value.score === bestScore,
  }))
}

export function buildOverallComparisonMetrics(properties: PropertyListing[]): ComparisonMetric[] {
  const maxPrice = Math.max(...properties.map((property) => property.price), 1)
  const maxSqft = Math.max(...properties.map((property) => property.sqft), 1)
  const maxBedrooms = Math.max(...properties.map((property) => property.bedrooms), 1)
  const maxAmenities = Math.max(...properties.map((property) => property.amenities.length), 1)

  const metricDefinitions: {
    id: string
    label: string
    description: string
    icon: ComparisonMetricIcon
    score: (property: PropertyListing) => number
    display: (property: PropertyListing) => string
  }[] = [
    {
      id: 'value',
      label: 'Value for money',
      description: 'Lower price within this comparison set scores higher',
      icon: 'value',
      score: (property) => Math.round((1 - property.price / maxPrice) * 100),
      display: formatListingPrice,
    },
    {
      id: 'area',
      label: 'Living space',
      description: 'Carpet area relative to the other selected listings',
      icon: 'area',
      score: (property) => Math.round((property.sqft / maxSqft) * 100),
      display: (property) => `${property.sqft.toLocaleString()} sqft`,
    },
    {
      id: 'rating',
      label: 'User rating',
      description: 'Average rating out of 5 stars',
      icon: 'rating',
      score: (property) => Math.round((property.rating / 5) * 100),
      display: (property) => `${property.rating.toFixed(1)} / 5`,
    },
    {
      id: 'bhk',
      label: 'Bedrooms',
      description: 'Bedroom count compared within this selection',
      icon: 'bhk',
      score: (property) => Math.round((property.bedrooms / maxBedrooms) * 100),
      display: (property) => `${property.bedrooms} BHK`,
    },
    {
      id: 'amenities',
      label: 'Amenities',
      description: 'Number of listed amenities and features',
      icon: 'amenities',
      score: (property) => Math.round((property.amenities.length / maxAmenities) * 100),
      display: (property) =>
        property.amenities.length > 0
          ? `${property.amenities.length} listed`
          : 'None listed',
    },
  ]

  return metricDefinitions.map((definition) => {
    const values = properties.map((property, index) => ({
      propertyId: property.id,
      name: shortPropertyName(property, index),
      displayValue: definition.display(property),
      score: definition.score(property),
      color: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
      isBest: false,
    }))

    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      icon: definition.icon,
      values: markBestValues(values),
    }
  })
}

export function buildOverallComparisonChartData(
  properties: PropertyListing[],
): Record<string, string | number>[] {
  const metrics = buildOverallComparisonMetrics(properties)

  return metrics.map((metric) => {
    const row: Record<string, string | number> = { metric: metric.label }
    metric.values.forEach((value) => {
      row[value.name] = value.score
    })
    return row
  })
}

export function getOverallComparisonTooltipDetails(
  properties: PropertyListing[],
): Map<string, Map<string, string>> {
  const metrics = buildOverallComparisonMetrics(properties)
  const details = new Map<string, Map<string, string>>()

  metrics.forEach((metric) => {
    const metricDetails = new Map<string, string>()
    metric.values.forEach((value) => {
      metricDetails.set(value.name, value.displayValue)
    })
    details.set(metric.label, metricDetails)
  })

  return details
}

export function buildPropertyOverallScores(properties: PropertyListing[]): PropertyOverallScore[] {
  const metrics = buildOverallComparisonMetrics(properties)

  const scores = properties.map((property, index) => {
    const average =
      metrics.reduce((total, metric) => {
        const value = metric.values.find((entry) => entry.propertyId === property.id)
        return total + (value?.score ?? 0)
      }, 0) / metrics.length

    return {
      propertyId: property.id,
      name: shortPropertyName(property, index),
      color: COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length],
      score: Math.round(average),
      rank: 0,
    }
  })

  const ranked = [...scores].sort((left, right) => right.score - left.score)
  ranked.forEach((entry, index) => {
    const match = scores.find((score) => score.propertyId === entry.propertyId)
    if (match) {
      match.rank = index + 1
    }
  })

  return scores
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
