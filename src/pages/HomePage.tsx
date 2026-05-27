import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Search, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

function getAuth0ErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('error_description') ?? params.get('error')
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-powered search',
    description: 'Describe your dream home in plain English and get instant structured filters.',
    tile: 'icon-tile-blue',
  },
  {
    icon: Building2,
    title: 'Premium listings',
    description: 'Apartments, villas, luxury homes, and budget flats across diverse locations.',
    tile: 'icon-tile-violet',
  },
  {
    icon: Shield,
    title: 'Secure access',
    description: 'Enterprise-grade Auth0 authentication for your saved searches and profile.',
    tile: 'icon-tile-sky',
  },
]

const stats = [
  { label: 'Listings tracked', value: '10K+' },
  { label: 'Cities covered', value: '12' },
  { label: 'Avg. match accuracy', value: '94%' },
]

export function HomePage() {
  const { loginWithRedirect, isLoading } = useAuth0()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(getAuth0ErrorFromUrl())

  useEffect(() => {
    if (loginError) window.history.replaceState({}, document.title, window.location.pathname)
  }, [loginError])

  async function handleLogin() {
    setLoginError(null)
    setIsRedirecting(true)
    try {
      await loginWithRedirect({ appState: { returnTo: '/dashboard' } })
    } catch (error) {
      setIsRedirecting(false)
      setLoginError(error instanceof Error ? error.message : 'Login redirect failed')
    }
  }

  return (
    <div className="hero-gradient min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <BrandLogo size="md" />
        <Button variant="outline" disabled={isLoading || isRedirecting} onClick={() => void handleLogin()}>
          Sign in
        </Button>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Badge variant="accent" className="gap-1.5 px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Property intelligence platform
            </Badge>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Find the right property,{' '}
              <span className="text-highlight">faster</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              AI search, smart filters, side-by-side comparison, and beautiful listings — all in one
              modern dashboard built for serious home buyers and renters.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" disabled={isLoading || isRedirecting} onClick={() => void handleLogin()}>
                {isRedirecting ? 'Redirecting…' : 'Get started free'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" disabled>
                <Search className="h-4 w-4" />
                Explore after login
              </Button>
            </div>
            {loginError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {loginError}
              </p>
            )}
            <div className="flex flex-wrap gap-6 pt-2">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Card className="overflow-hidden shadow-elevated">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Try an AI search
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;2BHK furnished apartment in Baner under 80 lakh with parking and gym&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Baner', '2 BHK', 'Under ₹80L', 'Furnished'].map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['Match score 92%', '12 listings', '3 localities', 'Instant filters'].map((item) => (
                    <div key={item} className="rounded-xl bg-accent/60 px-3 py-2 text-xs font-medium text-accent-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
              >
                <Card className="h-full transition-shadow hover:shadow-card">
                  <CardContent className="p-6">
                    <div className={`${feature.tile} mb-4 h-11 w-11`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
