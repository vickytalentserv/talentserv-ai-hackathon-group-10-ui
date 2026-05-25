import { describe, expect, it } from 'vitest'
import buildersJson from '../data/builders.json'
import propertiesJson from '../data/properties.json'
import sentimentJson from '../data/sentiment.json'
import trendsJson from '../data/trends.json'
import type { BuilderProfile, RawPropertyListing, SentimentInsight, TrendInsight } from '../types'
import { deduplicateProperties } from './deduplication'
import { buildDashboardModel } from './intelligence'
import { normalizePrice, normalizeProperties, normalizeProperty } from './normalization'
import { parseRequirement } from './requirementParser'

const properties = propertiesJson as RawPropertyListing[]
const builders = buildersJson as BuilderProfile[]
const sentiments = sentimentJson as SentimentInsight[]
const trends = trendsJson as TrendInsight[]

describe('property requirement parsing', () => {
  it('extracts buy-side Pune requirements from natural language', () => {
    const requirement = parseRequirement('Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move.')

    expect(requirement.city).toBe('Pune')
    expect(requirement.localities).toEqual(['Hinjewadi'])
    expect(requirement.transactionType).toBe('Buy')
    expect(requirement.bhk).toEqual([2])
    expect(requirement.budgetMax).toBe(8_000_000)
    expect(requirement.statusPreference).toBe('Ready to Move')
  })

  it('extracts rental ranges and normalizes Bangalore to Bengaluru', () => {
    const requirement = parseRequirement(
      'Need a rental apartment near Whitefield Bangalore, 2 or 3 BHK, budget under 45k per month.',
    )

    expect(requirement.city).toBe('Bengaluru')
    expect(requirement.localities).toEqual(['Whitefield'])
    expect(requirement.transactionType).toBe('Rent')
    expect(requirement.bhk).toEqual([2, 3])
    expect(requirement.budgetMax).toBe(45_000)
  })
})

describe('cleanup and normalization', () => {
  it('normalizes Indian price formats into rupees', () => {
    expect(normalizePrice('Rs 80 L')).toBe(8_000_000)
    expect(normalizePrice('80 Lac')).toBe(8_000_000)
    expect(normalizePrice('0.8 Cr')).toBe(8_000_000)
    expect(normalizePrice('42k per month')).toBe(42_000)
  })

  it('normalizes listing fields and derives price per square foot', () => {
    const normalized = normalizeProperty({
      title: '2 BHK Flat',
      source: 'Mock',
      city: 'bangalore',
      locality: 'Hinjawadi',
      transaction_type: 'Buy',
      bhk: '2 BHK Flat',
      price: '80 lakh',
      area_sqft: '850 sq.ft.',
      status: 'Ready',
      builder_or_owner: 'ABC Developers',
      project_name: 'Green Heights',
    })

    expect(normalized.city).toBe('Bengaluru')
    expect(normalized.locality).toBe('Hinjewadi')
    expect(normalized.propertyType).toBe('Apartment')
    expect(normalized.pricePerSqft).toBe(9412)
  })

  it('flags incomplete records for validation evidence', () => {
    const normalized = normalizeProperty({ title: 'Incomplete listing' })

    expect(normalized.incompleteFields).toEqual(
      expect.arrayContaining(['source', 'city', 'locality', 'price', 'area_sqft', 'bhk']),
    )
  })
})

describe('deduplication and dashboard logic', () => {
  it('detects duplicate listings across mock sources', () => {
    const normalized = normalizeProperties(properties)
    const result = deduplicateProperties(normalized)

    expect(result.duplicateGroups.length).toBeGreaterThanOrEqual(2)
    expect(result.uniqueProperties.length).toBeLessThan(properties.length)
    expect(result.duplicateGroups[0].propertyIds).toEqual(expect.arrayContaining(['PROP001', 'PROP002']))
  })

  it('builds ranked recommendations with enrichment context', () => {
    const requirement = parseRequirement('Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move.')
    const dashboard = buildDashboardModel(requirement, properties, builders, sentiments, trends)

    expect(dashboard.matchingProperties).toHaveLength(1)
    expect(dashboard.matchingProperties[0].projectName).toBe('Green Heights')
    expect(dashboard.matchingProperties[0].builderProfile?.reputationScore).toBe(86)
    expect(dashboard.matchingProperties[0].sentiment?.positiveThemes).toContain('IT park proximity')
    expect(dashboard.localityComparison[0].locality).toBe('Hinjewadi')
  })

  it('compares multiple localities for investment-style requirements', () => {
    const requirement = parseRequirement('Compare new projects in Wakad and Baner for investment under 1.2 crore.')
    const dashboard = buildDashboardModel(requirement, properties, builders, sentiments, trends)

    expect(dashboard.requirement.localities).toEqual(['Wakad', 'Baner'])
    expect(dashboard.matchingProperties.map((property) => property.locality)).toContain('Wakad')
    expect(dashboard.recommendationSummary).toContain('/100 fit score')
  })
})
