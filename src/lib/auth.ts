import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export interface AppUser {
  name: string
  email: string
  provider: 'Supabase OAuth' | 'Local demo'
}

const DEMO_USER_KEY = 'property-intel-demo-user'

let client: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  }

  return client
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  localStorage.removeItem(DEMO_USER_KEY)
}

export function createDemoUser(): AppUser {
  const user: AppUser = {
    name: 'Demo Buyer',
    email: 'demo.buyer@example.com',
    provider: 'Local demo',
  }
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
  return user
}

export function getStoredDemoUser(): AppUser | null {
  const rawUser = localStorage.getItem(DEMO_USER_KEY)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AppUser
  } catch {
    localStorage.removeItem(DEMO_USER_KEY)
    return null
  }
}

export function mapSupabaseUser(user: User): AppUser {
  return {
    name: user.user_metadata.full_name ?? user.email ?? 'Authenticated user',
    email: user.email ?? 'unknown@example.com',
    provider: 'Supabase OAuth',
  }
}
