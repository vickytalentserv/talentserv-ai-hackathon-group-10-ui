import { useAuth0 } from '@auth0/auth0-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  GitCompare,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import { auth0Config } from '@/config'
import { useCompareContext } from '@/context/CompareContext'
import { cn } from '@/lib/utils'
import { resolveDisplayEmail, resolveDisplayName } from '@/utils/profile'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/UserAvatar'
import { BrandLogo } from '@/components/layout/BrandLogo'

interface AppShellProps {
  children: ReactNode
  profileName?: string | null
  profilePicture?: string | null
}

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/saved', label: 'Shortlist', icon: Heart },
]

const toolNav = [{ to: '/upload', label: 'Data upload', icon: Upload }]

/** Desktop shell top bar — single row so the bottom border is one continuous line. */
const DESKTOP_TOP_BAR_CLASS =
  'fixed inset-x-0 top-0 z-40 hidden h-16 border-b border-border/80 lg:flex'

const SIDEBAR_BRAND_CELL_CLASS =
  'flex w-[17rem] shrink-0 items-center border-r border-[hsl(var(--sidebar-border))] bg-sidebar px-5'

/** Main header — same height as desktop top bar; mobile uses its own row + border. */
const MAIN_HEADER_ROW_CLASS =
  'flex h-14 shrink-0 items-center border-b border-border/80 lg:h-16 lg:border-b-0'

function SidebarNavItem({
  to,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number
  onNavigate?: () => void
}) {
  const isActive = Boolean(useMatch({ path: to, end: true }))

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-primary/12 via-sidebar-accent to-sidebar-accent text-foreground shadow-soft ring-1 ring-primary/10'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
      )}
    >
      {isActive && <span className="nav-active-indicator" aria-hidden />}
      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { compareCount } = useCompareContext()

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3">
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {mainNav.map(({ to, label, icon }) => (
          <SidebarNavItem
            key={to}
            to={to}
            label={label}
            icon={icon}
            badge={to === '/compare' ? compareCount : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tools
        </p>
        {toolNav.map(({ to, label, icon }) => (
          <SidebarNavItem key={to} to={to} label={label} icon={icon} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  )
}

export function AppShell({ children, profileName, profilePicture }: AppShellProps) {
  const { user, logout } = useAuth0()
  const [darkMode, setDarkMode] = useState(false)
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

  const sidebarContent = (onNavigate?: () => void, includeBrand = false) => (
    <>
      {includeBrand && (
        <div className="flex h-16 shrink-0 items-center border-b border-border/80 px-5 lg:hidden">
          <BrandLogo size="md" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 shadow-soft">
          <UserAvatar name={displayName} pictureUrl={pictureUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">Signed in</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() =>
            logout({ logoutParams: { returnTo: auth0Config.authorizationParams.redirect_uri } })
          }
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen app-mesh-bg">
      {/* Desktop: one top bar — brand + navbar share a single bottom border */}
      <div className={DESKTOP_TOP_BAR_CLASS}>
        <div className={cn(SIDEBAR_BRAND_CELL_CLASS, 'sidebar-gradient')}>
          <BrandLogo size="md" />
        </div>
        <header className="flex flex-1 items-center justify-end bg-card/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setDarkMode((v) => !v)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-2.5 py-1.5 shadow-soft sm:flex">
              <UserAvatar name={displayName} pictureUrl={pictureUrl} className="h-7 w-7" />
              <span className="max-w-[120px] truncate text-xs font-medium text-muted-foreground">
                {displayName}
              </span>
            </div>
          </div>
        </header>
      </div>

      <aside className="sidebar-gradient fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-[hsl(var(--sidebar-border))] pt-16 lg:flex">
        {sidebarContent()}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[17rem] lg:pt-16">
        <header
          className={cn(
            MAIN_HEADER_ROW_CLASS,
            'sticky top-0 z-30 justify-between bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:hidden',
          )}
        >
          <div className="flex items-center gap-3 lg:hidden">
            <BrandLogo size="sm" />
          </div>
          <div className="hidden flex-1 lg:block" />
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setDarkMode((v) => !v)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-2.5 py-1.5 shadow-soft sm:flex">
              <UserAvatar name={displayName} pictureUrl={pictureUrl} className="h-7 w-7" />
              <span className="max-w-[120px] truncate text-xs font-medium text-muted-foreground">
                {displayName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="sidebar-gradient fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-[hsl(var(--sidebar-border))] shadow-elevated lg:hidden"
              >
                <div className="flex justify-end p-3">
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {sidebarContent(() => setMobileNavOpen(false), true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
