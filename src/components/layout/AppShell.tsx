import { useAuth0 } from '@auth0/auth0-react'
import { Building2, GitCompare, Heart, LayoutDashboard, LogOut, Menu, Moon, Sun, Upload, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { auth0Config } from '@/config'
import { useCompareContext } from '@/context/CompareContext'
import { cn } from '@/lib/utils'
import { resolveDisplayEmail, resolveDisplayName } from '@/utils/profile'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/UserAvatar'

interface AppShellProps {
  children: ReactNode
  profileName?: string | null
  profilePicture?: string | null
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/upload', label: 'Upload Data', icon: Upload },
  { to: '/saved', label: 'Shortlist', icon: Heart },
]

export function AppShell({ children, profileName, profilePicture }: AppShellProps) {
  const { user, logout } = useAuth0()
  const { compareCount } = useCompareContext()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const displayName =
    profileName ?? resolveDisplayName(undefined, user) ?? resolveDisplayEmail(undefined, user) ?? 'User'
  const pictureUrl = profilePicture ?? user?.picture

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 md:gap-8">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <NavLink to="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileNavOpen(false)}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md">
                R
              </span>
              <span className="hidden font-semibold tracking-tight sm:inline">RealEstate AI</span>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {to === '/compare' && compareCount > 0 && (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {compareCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDarkMode((value) => !value)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="hidden items-center gap-2 sm:flex">
              <UserAvatar name={displayName} pictureUrl={pictureUrl} />
              <span className="max-w-[140px] truncate text-sm font-medium">{displayName}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: auth0Config.authorizationParams.redirect_uri,
                  },
                })
              }
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {to === '/compare' && compareCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {compareCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
