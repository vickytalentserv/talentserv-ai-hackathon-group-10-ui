import type { User } from '@auth0/auth0-react'

function isEmailLike(value: string): boolean {
  return value.includes('@')
}

export function resolveDisplayEmail(
  apiEmail?: string | null,
  auth0User?: User | null,
): string | null {
  return apiEmail ?? auth0User?.email ?? null
}

export function resolveDisplayName(
  apiName?: string | null,
  auth0User?: User | null,
): string | null {
  if (apiName && !isEmailLike(apiName)) {
    return apiName
  }

  for (const candidate of [auth0User?.name, auth0User?.nickname]) {
    if (candidate && !isEmailLike(candidate)) {
      return candidate
    }
  }

  const email = auth0User?.email
  if (email) {
    const localPart = email.split('@')[0] ?? ''
    if (localPart) {
      return localPart.charAt(0).toUpperCase() + localPart.slice(1)
    }
  }

  return null
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return (parts[0]?.[0] ?? 'U').toUpperCase()
}

export function isLikelyBrokenPictureUrl(url?: string | null): boolean {
  if (!url) {
    return true
  }

  try {
    const parsed = new URL(url)
    return parsed.protocol !== 'https:' && parsed.protocol !== 'http:'
  } catch {
    return true
  }
}
