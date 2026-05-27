import type { ParsedRequirement } from '../api/client'

export function normalizeBudgetCurrency(currency: string, rawText = ''): 'INR' | 'USD' {
  const raw = rawText.toLowerCase()
  if (raw.includes('$') || raw.includes('usd') || raw.includes('dollar')) {
    return currency === 'USD' ? 'USD' : 'INR'
  }
  return 'INR'
}

export function formatBudget(
  min: number | null | undefined,
  max: number | null | undefined,
  _currency: string,
  _rawText = '',
): string {
  const format = (value: number) => {
    const symbol = '₹'
    if (value >= 10_000_000) {
      return `${symbol}${(value / 10_000_000).toFixed(2)} Cr`
    }
    if (value >= 100_000) {
      return `${symbol}${(value / 100_000).toFixed(2)} L`
    }
    return `${symbol}${new Intl.NumberFormat('en-IN').format(value)}`
  }

  if (min != null && max != null) {
    return `${format(min)} – ${format(max)}`
  }
  if (max != null) {
    return `Up to ${format(max)}`
  }
  if (min != null) {
    return `From ${format(min)}`
  }
  return '—'
}

export function requirementToParsed(requirement: {
  raw_text: string
  intent: ParsedRequirement['intent']
  bedrooms: number | null
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  locality: string | null
  city: string | null
  property_type: string | null
  parser: string
  confidence: number
}): ParsedRequirement {
  return {
    raw_text: requirement.raw_text,
    intent: requirement.intent,
    bedrooms: requirement.bedrooms,
    budget_min: requirement.budget_min,
    budget_max: requirement.budget_max,
    budget_currency: requirement.budget_currency,
    locality: requirement.locality,
    city: requirement.city,
    property_type: requirement.property_type,
    parser: requirement.parser,
    confidence: requirement.confidence,
  }
}
