import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigation, workspaces } from '@/constants/mock-data'
import { APP_NAME, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/constants/navigation'
import { useAppStore } from '@/store/app-store'
import { getNavIcon } from '@/utils/icon-mapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { NavItem } from '@/types'

function NavLinkItem({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem
  collapsed: boolean
  depth?: number
}) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const Icon = getNavIcon(item.icon)
  const isActive =
    location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href))
  const hasChildren = item.children && item.children.length > 0

  const linkContent = (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-soft'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        depth > 0 && 'ml-4 py-1.5 text-xs',
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <Icon className={cn('relative z-10 h-4 w-4 shrink-0', isActive && 'text-primary')} />
      {!collapsed && (
        <>
          <span className="relative z-10 flex-1 truncate">{item.label}</span>
          {item.badge && (
            <Badge
              variant={item.badge === 'New' ? 'default' : 'secondary'}
              className="relative z-10 h-5 px-1.5 text-[10px]"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                'relative z-10 h-3.5 w-3.5 transition-transform',
                expanded && 'rotate-180',
              )}
            />
          )}
        </>
      )}
    </div>
  )

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            linkContent
          )}
        </button>
        <AnimatePresence>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5 border-l border-sidebar-border pl-2">
                {item.children!.map((child) => (
                  <NavLinkItem key={child.id} item={child} collapsed={collapsed} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const link = (
    <Link to={item.href} aria-current={isActive ? 'page' : undefined}>
      {linkContent}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeWorkspace, setActiveWorkspace } =
    useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold tracking-tight"
          >
            {APP_NAME}
          </motion.span>
        )}
      </div>

      {!sidebarCollapsed && (
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-background/50 font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {activeWorkspace.avatar}
                  </div>
                  <div className="truncate text-left">
                    <p className="truncate text-sm font-medium">{activeWorkspace.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {activeWorkspace.plan}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className="gap-2"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {ws.avatar}
                  </div>
                  <div>
                    <p className="text-sm">{ws.name}</p>
                    <p className="text-xs text-muted-foreground">{ws.plan}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 pb-4" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLinkItem key={item.id} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? 'icon' : 'default'}
          className={cn('w-full', !sidebarCollapsed && 'justify-start gap-2')}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  )
}
