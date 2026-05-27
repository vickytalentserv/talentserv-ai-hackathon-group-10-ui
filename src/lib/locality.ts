import type { PropertyListing } from '@/types/property'

const INVALID_LOCALITY =
  /\b(sqft|status|floor|transaction|super area|ready to move|resale|furnish|bhk|bedroom|apartment|flat|villa|property|road|street|gardens|area|sector|phase|plot|tower|wing|highway|expressway|connected|attractive|spacious|luxury|premium|beautiful|available|looking|located|project|society|complex|building|residence|residential|commercial)\b/i

const STOPWORDS =
  /\b(a|an|the|has|have|had|is|are|was|were|well|with|for|from|this|that|your|our|new|old|and|or|but|near|under|within|about|also|very|just|only|more|most|some|any|all|each|every|both|such|than|then|there|here|where|when|what|which|who|how|why|can|could|will|would|should|may|might|must|being|been|does|did|get|got|make|made|take|give|come|go|see|know|want|need|use|find|tell|say|ask|work|seem|feel|try|leave|call|keep|let|put|mean|set|show|help|start|run|move|live|believe|bring|happen|write|provide|sit|stand|lose|pay|meet|include|continue|learn|change|lead|understand|watch|follow|stop|create|speak|read|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|send|expect|build|stay|fall|cut|reach|remain|suggest|raise|pass|sell|require|report|decide|pull|attractive|connected|located|looking|spacious|luxury|premium|beautiful|available|excellent|perfect|ideal|great|good|best|top|high|low|large|small|big|nice|prime|leading|upcoming|ready|fully|semi|un|non|pre|post|per|via|off|out|up|down|over|back|away|as|at|by|on|in|to|of|be|do|if|so|no|not|it|its|we|you|he|she|they|them|their|his|her|my|me|us|am|was|were|been|being|has|had|having|does|did|doing|done|attractive)\b/i

const ADDRESS_PART =
  /\b(road|street|lane|avenue|highway|expressway|marg|nagar|colony|society|tower|wing|floor|flat|plot|sector|phase|block|cross|main|ring|station|metro|junction|circle|market|industrial|estate|park|garden|layout|enclave|heights|residency|apartments|complex|building|pincode|pin)\b/i

const CITY_ALIASES: Record<string, string[]> = {
  bengaluru: ['bengaluru', 'bangalore'],
  mumbai: ['mumbai', 'bombay'],
  delhi: ['delhi', 'new delhi', 'ncr'],
  pune: ['pune'],
  chennai: ['chennai', 'madras'],
  hyderabad: ['hyderabad'],
  gurgaon: ['gurgaon', 'gurugram'],
  kolkata: ['kolkata', 'calcutta'],
}

const KNOWN_LOCALITIES: Record<string, string> = {
  baner: 'Baner',
  hinjewadi: 'Hinjewadi',
  'koregaon park': 'Koregaon Park',
  wakad: 'Wakad',
  kharadi: 'Kharadi',
  magarpatta: 'Magarpatta',
  aundh: 'Aundh',
  'viman nagar': 'Viman Nagar',
  kothrud: 'Kothrud',
  hadapsar: 'Hadapsar',
  somatane: 'Somatane',
  bhosari: 'Bhosari',
  bandra: 'Bandra West',
  'bandra west': 'Bandra West',
  andheri: 'Andheri East',
  'andheri east': 'Andheri East',
  'andheri west': 'Andheri West',
  powai: 'Powai',
  worli: 'Worli',
  juhu: 'Juhu',
  goregaon: 'Goregaon West',
  'goregaon west': 'Goregaon West',
  chembur: 'Chembur East',
  'chembur east': 'Chembur East',
  malad: 'Malad West',
  'malad west': 'Malad West',
  thane: 'Thane West',
  'thane west': 'Thane West',
  kharghar: 'Kharghar',
  'lower parel': 'Lower Parel',
  dadar: 'Dadar',
  borivali: 'Borivali',
  'borivali west': 'Borivali West',
  'borivali east': 'Borivali East',
  'vile parle': 'Vile Parle',
  santacruz: 'Santacruz',
  mulund: 'Mulund',
  nerul: 'Nerul',
  panvel: 'Panvel',
  koramangala: 'Koramangala',
  indiranagar: 'Indiranagar',
  whitefield: 'Whitefield',
  'hsr layout': 'HSR Layout',
  bellandur: 'Bellandur',
  'electronic city': 'Electronic City',
  jayanagar: 'Jayanagar',
  marathahalli: 'Marathahalli',
  sarjapur: 'Sarjapur',
  hebbal: 'Hebbal',
  'btm layout': 'BTM Layout',
  'mg road': 'MG Road',
  yelahanka: 'Yelahanka',
}

const LOCALITY_TO_CITY: Record<string, string> = {
  baner: 'Pune',
  hinjewadi: 'Pune',
  'koregaon park': 'Pune',
  wakad: 'Pune',
  kharadi: 'Pune',
  magarpatta: 'Pune',
  aundh: 'Pune',
  'viman nagar': 'Pune',
  kothrud: 'Pune',
  hadapsar: 'Pune',
  somatane: 'Pune',
  bhosari: 'Pune',
  bandra: 'Mumbai',
  'bandra west': 'Mumbai',
  andheri: 'Mumbai',
  'andheri east': 'Mumbai',
  'andheri west': 'Mumbai',
  powai: 'Mumbai',
  worli: 'Mumbai',
  juhu: 'Mumbai',
  goregaon: 'Mumbai',
  'goregaon west': 'Mumbai',
  chembur: 'Mumbai',
  'chembur east': 'Mumbai',
  malad: 'Mumbai',
  'malad west': 'Mumbai',
  thane: 'Mumbai',
  'thane west': 'Mumbai',
  kharghar: 'Mumbai',
  'lower parel': 'Mumbai',
  dadar: 'Mumbai',
  borivali: 'Mumbai',
  'borivali west': 'Mumbai',
  'borivali east': 'Mumbai',
  'vile parle': 'Mumbai',
  santacruz: 'Mumbai',
  mulund: 'Mumbai',
  nerul: 'Mumbai',
  panvel: 'Mumbai',
  koramangala: 'Bengaluru',
  indiranagar: 'Bengaluru',
  whitefield: 'Bengaluru',
  'hsr layout': 'Bengaluru',
  bellandur: 'Bengaluru',
  'electronic city': 'Bengaluru',
  jayanagar: 'Bengaluru',
  marathahalli: 'Bengaluru',
  sarjapur: 'Bengaluru',
  hebbal: 'Bengaluru',
  'btm layout': 'Bengaluru',
  'mg road': 'Bengaluru',
  yelahanka: 'Bengaluru',
}

const KNOWN_LOCALITY_KEYS = Object.keys(KNOWN_LOCALITIES).sort((a, b) => b.length - a.length)

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function localityMatchesCity(localityKey: string, city?: string): boolean {
  if (!city) {
    return true
  }

  const localityCity = LOCALITY_TO_CITY[localityKey]
  if (!localityCity) {
    return true
  }

  return normalizeCityName(localityCity) === normalizeCityName(city)
}

export function normalizePlaceName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function normalizeCityName(city: string): string {
  const normalized = normalizePlaceName(city)
  for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.includes(normalized) || canonical === normalized) {
      return canonical
    }
  }
  return normalized
}

export function citySearchTerms(city: string): string[] {
  const canonical = normalizeCityName(city)
  return CITY_ALIASES[canonical] ?? [canonical]
}

export function propertyMatchesCity(property: PropertyListing, city: string): boolean {
  const terms = citySearchTerms(city)
  const propertyCity = normalizeCityName(property.city)
  return terms.includes(propertyCity) || terms.some((term) => propertyCity === normalizeCityName(term))
}

export function titleCasePlace(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function isValidLocalityName(name: string, city?: string): boolean {
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 35) {
    return false
  }

  const normalized = normalizePlaceName(trimmed)
  if (KNOWN_LOCALITIES[normalized]) {
    return localityMatchesCity(normalized, city)
  }

  if (INVALID_LOCALITY.test(trimmed) || STOPWORDS.test(trimmed) || ADDRESS_PART.test(trimmed)) {
    return false
  }

  if (/\d/.test(trimmed)) {
    return false
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length > 3) {
    return false
  }

  if (!/^[A-Za-z][A-Za-z\s'-]*$/.test(trimmed)) {
    return false
  }

  if (city) {
    const cityNorm = normalizeCityName(city)
    if (normalized === cityNorm) {
      return false
    }

    for (const term of citySearchTerms(city)) {
      if (normalized.startsWith(`${term} `)) {
        return false
      }
    }
  }

  return true
}

export function findKnownLocalityInText(text: string, city?: string): string | null {
  const normalized = normalizePlaceName(text)

  for (const key of KNOWN_LOCALITY_KEYS) {
    if (!localityMatchesCity(key, city)) {
      continue
    }

    const pattern = new RegExp(`\\b${escapeRegex(key)}\\b`, 'i')
    if (pattern.test(normalized)) {
      return KNOWN_LOCALITIES[key]
    }
  }

  return null
}

function isLikelyAddressPart(part: string): boolean {
  return ADDRESS_PART.test(part) || /\d/.test(part) || part.length > 40
}

export function extractLocalityFromAddress(address: string, city?: string): string | null {
  const known = findKnownLocalityInText(address, city)
  if (known) {
    return known
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index]
    if (isLikelyAddressPart(part)) {
      continue
    }
    if (isValidLocalityName(part, city)) {
      return titleCasePlace(part)
    }
  }

  return null
}

function extractLocalityFromTitle(title: string, city?: string): string | null {
  const known = findKnownLocalityInText(title, city)
  if (known) {
    return known
  }

  const inMatch = title.match(/\b(?:in|at|near|around)\s+([A-Za-z][A-Za-z\s-]{1,24}?)(?:\s+(?:area|under|near|for|with|on|by)\b|,|$)/i)
  if (inMatch?.[1] && isValidLocalityName(inMatch[1], city)) {
    return titleCasePlace(inMatch[1])
  }

  return null
}

export function resolvePropertyLocality(property: PropertyListing): string | null {
  const city = property.city
  const searchableText = [property.title, property.location, property.locality].filter(Boolean).join(' ')

  const known = findKnownLocalityInText(searchableText, city)
  if (known) {
    return known
  }

  if (property.locality && isValidLocalityName(property.locality, city)) {
    return titleCasePlace(property.locality)
  }

  const locationParts = property.location.split(',').map((part) => part.trim()).filter(Boolean)
  if (locationParts.length >= 2) {
    const beforeCity = locationParts[locationParts.length - 2]
    if (beforeCity && !isLikelyAddressPart(beforeCity) && isValidLocalityName(beforeCity, city)) {
      return titleCasePlace(beforeCity)
    }
  }

  for (const part of locationParts) {
    if (isLikelyAddressPart(part)) {
      continue
    }
    if (isValidLocalityName(part, city)) {
      return titleCasePlace(part)
    }
  }

  const fromTitle = extractLocalityFromTitle(property.title, city)
  if (fromTitle) {
    return fromTitle
  }

  return extractLocalityFromAddress(property.location, city)
}
