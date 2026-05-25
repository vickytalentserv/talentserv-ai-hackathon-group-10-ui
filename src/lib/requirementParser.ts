import type { ParsedRequirement, PropertyStatus, TransactionType } from '../types'
import { normalizeCity, normalizeLocality, normalizePrice } from './normalization'

const CITY_PATTERNS = ['pune', 'bangalore', 'bengaluru']

const LOCALITY_PATTERNS = [
  'hinjawadi',
  'hinjewadi',
  'wakad',
  'baner',
  'whitefield',
  'sarjapur road',
  'sarjapur',
]

const LOCALITY_CITY: Record<string, string> = {
  Hinjewadi: 'Pune',
  Wakad: 'Pune',
  Baner: 'Pune',
  Whitefield: 'Bengaluru',
  'Sarjapur Road': 'Bengaluru',
}

export function parseRequirement(input: string): ParsedRequirement {
  const normalizedInput = input.toLowerCase()
  const localities = extractLocalities(normalizedInput)
  const city = extractCity(normalizedInput, localities)
  const bhk = extractBhk(normalizedInput)
  const budgetMax = extractBudget(normalizedInput)
  const transactionType = extractTransactionType(normalizedInput, budgetMax)
  const statusPreference = extractStatus(normalizedInput)
  const propertyType = extractPropertyType(normalizedInput)
  const preferenceNotes = extractPreferenceNotes(input)
  const confidence = calculateConfidence({
    city,
    localities,
    transactionType,
    bhk,
    budgetMax,
    propertyType,
    statusPreference,
  })

  return {
    rawInput: input,
    city,
    localities,
    transactionType,
    bhk,
    budgetMax,
    propertyType,
    statusPreference,
    preferenceNotes,
    confidence,
  }
}

function extractCity(input: string, localities: string[]): string | undefined {
  const city = CITY_PATTERNS.find((candidate) => input.includes(candidate))
  if (city) {
    return normalizeCity(city)
  }

  const inferredCity = localities.map((locality) => LOCALITY_CITY[locality]).find(Boolean)
  return inferredCity
}

function extractLocalities(input: string): string[] {
  const found = LOCALITY_PATTERNS.filter((candidate) => input.includes(candidate)).map(normalizeLocality)
  return Array.from(new Set(found))
}

function extractBhk(input: string): number[] {
  const rangeMatch = input.match(/(\d+)\s*(?:or|\/|-)\s*(\d+)\s*bhk/)
  if (rangeMatch) {
    return [Number(rangeMatch[1]), Number(rangeMatch[2])].sort((a, b) => a - b)
  }

  const values = Array.from(input.matchAll(/(\d+)\s*bhk/g), (match) => Number(match[1]))
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

function extractBudget(input: string): number | undefined {
  const budgetMatch = input.match(
    /(?:under|below|upto|up to|budget(?:\s*(?:under|of|is))?)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l|k|thousand)?/,
  )
  if (budgetMatch) {
    return normalizePrice(`${budgetMatch[1]} ${budgetMatch[2] ?? ''}`)
  }

  const amountMatch = input.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k|thousand)\b/)
  return amountMatch ? normalizePrice(`${amountMatch[1]} ${amountMatch[2]}`) : undefined
}

function extractTransactionType(input: string, budgetMax?: number): TransactionType | undefined {
  if (/rent|rental|lease|tenant|per\s*month|monthly/.test(input)) {
    return 'Rent'
  }

  if (/buy|purchase|invest|sale|new\s*project|resale|ready\s*to\s*move/.test(input)) {
    return 'Buy'
  }

  return budgetMax && budgetMax < 200_000 ? 'Rent' : 'Buy'
}

function extractStatus(input: string): PropertyStatus | undefined {
  if (/ready|ready\s*to\s*move|immediate/.test(input)) {
    return 'Ready to Move'
  }
  if (/under\s*construction|new\s*project|launch|possession/.test(input)) {
    return 'Under Construction'
  }
  if (/resale/.test(input)) {
    return 'Resale'
  }

  return undefined
}

function extractPropertyType(input: string): string | undefined {
  if (/villa|row\s*house/.test(input)) {
    return 'Villa'
  }
  if (/apartment|flat|bhk/.test(input)) {
    return 'Apartment'
  }

  return undefined
}

function extractPreferenceNotes(input: string): string[] {
  const notes: string[] = []
  const nearMatch = input.match(/\bnear\s+([^,.]+)/i)
  if (nearMatch) {
    notes.push(`Near ${nearMatch[1].trim()}`)
  }

  if (/investment/i.test(input)) {
    notes.push('Investment-oriented comparison')
  }

  return notes
}

function calculateConfidence(requirement: Omit<ParsedRequirement, 'rawInput' | 'confidence' | 'preferenceNotes'>): number {
  const signals = [
    requirement.city,
    requirement.localities.length > 0,
    requirement.transactionType,
    requirement.bhk.length > 0,
    requirement.budgetMax,
    requirement.propertyType,
    requirement.statusPreference,
  ]

  const score = signals.filter(Boolean).length / signals.length
  return Math.round(score * 100)
}
