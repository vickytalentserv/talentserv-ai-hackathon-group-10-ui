import { motion, AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import { useIsMobile } from '@/hooks/use-media-query'
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/constants/navigation'
import { Sidebar } from '@/layouts/Sidebar'
import { Navbar } from '@/layouts/Navbar'
import { CommandMenu } from '@/layouts/CommandMenu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { navigation } from '@/constants/mock-data'
import { getNavIcon } from '@/utils/icon-mapper'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard',
    description: 'Property intelligence overview',
  },
  '/properties': {
    title: 'Properties',
    description: 'Browse and manage property listings',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'Market trends and insights',
  },
  '/requirements': {
    title: 'Requirements',
    description: 'Natural-language property search',
  },
  '/recommendations': {
    title: 'Recommendations',
    description: 'AI-ranked property suggestions',
  },
  '/reports': {
    title: 'Reports',
    description: 'Export and analysis reports',
  },
  '/settings': {
    title: 'Settings',
    description: 'Workspace configuration',
  },
}

function MobileSidebarContent() {
  const location = useLocation()
  const { setMobileSidebarOpen } = useAppStore()

  return (
    <ScrollArea className="h-full">
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = getNavIcon(item.icon)
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </ScrollArea>
  )
}

function getPageMeta(pathname: string) {
  if (pageMeta[pathname]) return pageMeta[pathname]
  const match = Object.entries(pageMeta).find(
    ([path]) => path !== '/' && pathname.startsWith(path),
  )
  return match?.[1] ?? pageMeta['/']!
}

export function DashboardLayout() {
  const location = useLocation()
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useAppStore()
  const isMobile = useIsMobile()
  const meta = getPageMeta(location.pathname)

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex min-h-screen flex-col"
      >
        <Navbar title={meta.title} description={meta.description} />
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <CommandMenu />
    </div>
  )
}
