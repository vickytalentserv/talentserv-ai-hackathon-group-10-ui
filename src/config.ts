const PLACEHOLDER_PATTERNS = [
  'dev-placeholder',
  'your-tenant',
  'your_spa_client_id',
  'your-app.vercel.app',
]

function requiredEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  if (PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern))) {
    throw new Error(
      `${name} still uses a placeholder value. Update talentserv-ai-hackathon-group-10-ui/.env with your real Auth0 settings (see docs/AUTH0_SETUP.md).`,
    )
  }
  return value
}

export const auth0Config = {
  domain: requiredEnv('VITE_AUTH0_DOMAIN'),
  clientId: requiredEnv('VITE_AUTH0_CLIENT_ID'),
  authorizationParams: {
    redirect_uri: requiredEnv('VITE_AUTH0_REDIRECT_URI'),
  },
}

export const auth0Audience = requiredEnv('VITE_AUTH0_AUDIENCE')
export const apiBaseUrl = requiredEnv('VITE_API_BASE_URL')
