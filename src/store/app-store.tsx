import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Theme, Workspace } from '@/types'
import { workspaces as defaultWorkspaces } from '@/constants/mock-data'

interface AppState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  activeWorkspace: Workspace
  commandOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  setActiveWorkspace: (workspace: Workspace) => void
  setCommandOpen: (open: boolean) => void
}

const AppContext = createContext<AppState | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored ?? 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(theme),
  )
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    defaultWorkspaces[0]!,
  )
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolved = resolveTheme('system')
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const value = useMemo<AppState>(
    () => ({
      sidebarCollapsed,
      mobileSidebarOpen,
      theme,
      resolvedTheme,
      activeWorkspace,
      commandOpen,
      toggleSidebar,
      setSidebarCollapsed,
      setMobileSidebarOpen,
      setTheme,
      setActiveWorkspace,
      setCommandOpen,
    }),
    [
      sidebarCollapsed,
      mobileSidebarOpen,
      theme,
      resolvedTheme,
      activeWorkspace,
      commandOpen,
      toggleSidebar,
      setTheme,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
