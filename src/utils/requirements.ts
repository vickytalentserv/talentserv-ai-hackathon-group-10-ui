import type { ParsedRequirement } from '../api/client'

export function formatBudget(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
): string {
  const symbol = currency === 'INR' ? '₹' : '$'
  const format = (value: number) =>
    `${symbol}${new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US').format(value)}`

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
