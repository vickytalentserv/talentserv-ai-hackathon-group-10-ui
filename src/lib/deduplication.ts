import type { DuplicateGroup, NormalizedProperty } from '../types'

export interface DeduplicationResult {
  uniqueProperties: NormalizedProperty[]
  duplicateGroups: DuplicateGroup[]
}

export function deduplicateProperties(properties: NormalizedProperty[]): DeduplicationResult {
  const consumed = new Set<string>()
  const uniqueProperties: NormalizedProperty[] = []
  const duplicateGroups: DuplicateGroup[] = []

  properties.forEach((property) => {
    if (consumed.has(property.propertyId)) {
      return
    }

    const duplicates = properties.filter(
      (candidate) => candidate.propertyId !== property.propertyId && !consumed.has(candidate.propertyId) && isDuplicate(property, candidate),
    )

    if (duplicates.length === 0) {
      uniqueProperties.push(property)
      consumed.add(property.propertyId)
      return
    }

    const group = [property, ...duplicates]
    const canonical = chooseCanonical(group)
    const groupId = `DUP-${duplicateGroups.length + 1}`
    duplicateGroups.push({
      groupId,
      canonicalPropertyId: canonical.propertyId,
      propertyIds: group.map((listing) => listing.propertyId),
      reason: buildDuplicateReason(group),
    })

    uniqueProperties.push(canonical)
    group.forEach((listing) => consumed.add(listing.propertyId))
  })

  return { uniqueProperties, duplicateGroups }
}

export function isDuplicate(first: NormalizedProperty, second: NormalizedProperty): boolean {
  if (first.sourceUrl && second.sourceUrl && first.sourceUrl === second.sourceUrl) {
    return true
  }

  if (
    first.city !== second.city ||
    first.locality !== second.locality ||
    first.transactionType !== second.transactionType ||
    first.bhk !== second.bhk
  ) {
    return false
  }

  const sameProject = normalizeText(first.projectName) === normalizeText(second.projectName)
  const similarTitle = textSimilarity(first.title, second.title) >= 0.35
  const closePrice = relativeDifference(first.price, second.price) <= 0.06
  const closeArea = relativeDifference(first.areaSqft, second.areaSqft) <= 0.06

  return (sameProject || similarTitle) && closePrice && closeArea
}

function chooseCanonical(properties: NormalizedProperty[]): NormalizedProperty {
  return [...properties].sort((first, second) => qualityScore(second) - qualityScore(first))[0]
}

function qualityScore(property: NormalizedProperty): number {
  return [
    property.sourceUrl ? 2 : 0,
    property.incompleteFields.length === 0 ? 3 : 0,
    property.price > 0 ? 1 : 0,
    property.areaSqft > 0 ? 1 : 0,
    property.builderOrOwner !== 'Unknown builder/owner' ? 1 : 0,
  ].reduce((sum, score) => sum + score, 0)
}

function buildDuplicateReason(properties: NormalizedProperty[]): string {
  const projects = Array.from(new Set(properties.map((property) => property.projectName))).join(', ')
  const sources = Array.from(new Set(properties.map((property) => property.source))).join(' + ')
  return `${projects} appears across ${sources} with matching locality, BHK, price, and area.`
}

function textSimilarity(first: string, second: string): number {
  const firstTokens = tokenize(first)
  const secondTokens = tokenize(second)
  const intersection = firstTokens.filter((token) => secondTokens.includes(token))
  const union = Array.from(new Set([...firstTokens, ...secondTokens]))

  return union.length === 0 ? 0 : intersection.length / union.length
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !['bhk', 'flat', 'apartment'].includes(token))
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function relativeDifference(first: number, second: number): number {
  if (first === 0 || second === 0) {
    return Number.POSITIVE_INFINITY
  }

  return Math.abs(first - second) / Math.max(first, second)
}
