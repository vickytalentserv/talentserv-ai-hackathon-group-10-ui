import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { mockDashboardData } from '@/constants/mock-data'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavbarProps {
  title?: string
  description?: string
}

export function Navbar({ title = 'Dashboard', description }: NavbarProps) {
  const {
    setCommandOpen,
    setMobileSidebarOpen,
    theme,
    setTheme,
    resolvedTheme,
  } = useAppStore()

  const unreadCount = mockDashboardData.notifications.filter((n) => !n.read).length

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>

      <Button
        variant="outline"
        className="hidden h-9 w-full max-w-xs justify-start gap-2 text-muted-foreground md:flex"
        onClick={() => setCommandOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setCommandOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-72">
            {mockDashboardData.notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{notif.title}</span>
                  {!notif.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{notif.message}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(notif.timestamp)}
                </span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">GK</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">Gaurav K.</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Gaurav Khadake</span>
              <span className="text-xs font-normal text-muted-foreground">
                gaurav@propintel.io
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
