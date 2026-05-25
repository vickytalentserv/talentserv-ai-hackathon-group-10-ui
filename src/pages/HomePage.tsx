import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Search, Shield, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

function getAuth0ErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('error_description') ?? params.get('error')
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-powered search',
    description: 'Describe your dream home in plain English and get instant structured filters.',
  },
  {
    icon: Building2,
    title: 'Premium listings',
    description: 'Apartments, villas, luxury homes, and budget flats across diverse locations.',
  },
  {
    icon: Shield,
    title: 'Secure access',
    description: 'Enterprise-grade Auth0 authentication for your saved searches and profile.',
  },
]

export function HomePage() {
  const { loginWithRedirect, isLoading } = useAuth0()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(getAuth0ErrorFromUrl())

  useEffect(() => {
    if (loginError) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [loginError])

  async function handleLogin() {
    setLoginError(null)
    setIsRedirecting(true)

    try {
      await loginWithRedirect({
        appState: { returnTo: '/dashboard' },
      })
    } catch (error) {
      setIsRedirecting(false)
      setLoginError(error instanceof Error ? error.message : 'Login redirect failed')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered Real Estate Platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next home,{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              smarter
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A premium SaaS-style dashboard for natural language property search, smart filtering,
            and beautiful listing discovery.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" disabled={isLoading || isRedirecting} onClick={() => void handleLogin()}>
              {isRedirecting ? 'Redirecting…' : 'Sign in to dashboard'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" disabled>
              <Search className="h-4 w-4" />
              Explore demo after login
            </Button>
          </div>

          {loginError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{loginError}</p>
          )}
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1 }}
              >
                <Card className="h-full p-5 transition-shadow hover:shadow-lg">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
