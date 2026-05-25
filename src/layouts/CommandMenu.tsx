import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { Command } from 'cmdk'
import { useAppStore } from '@/store/app-store'

const commands = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, shortcut: 'D' },
  { label: 'Properties', href: '/properties', icon: Building2, shortcut: 'P' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, shortcut: 'A' },
  { label: 'Requirements', href: '/requirements', icon: Search, shortcut: 'R' },
  { label: 'Recommendations', href: '/recommendations', icon: Sparkles, shortcut: 'N' },
  { label: 'Reports', href: '/reports', icon: FileText, shortcut: 'T' },
  { label: 'Settings', href: '/settings', icon: Settings, shortcut: 'S' },
]

export function CommandMenu() {
  const { commandOpen, setCommandOpen } = useAppStore()
  const navigate = useNavigate()

  const runCommand = (href: string) => {
    setCommandOpen(false)
    navigate(href)
  }

  return (
    <Command.Dialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed left-[50%] top-[18%] z-50 w-full max-w-lg translate-x-[-50%] overflow-hidden rounded-xl border border-border bg-popover shadow-elevated">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            placeholder="Search pages, actions..."
            className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>
          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {commands.map((cmd) => (
              <Command.Item
                key={cmd.href}
                value={cmd.label}
                onSelect={() => runCommand(cmd.href)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent"
              >
                <cmd.icon className="h-4 w-4 text-muted-foreground" />
                <span>{cmd.label}</span>
                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                  {cmd.shortcut}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Separator className="my-1 h-px bg-border" />
          <Command.Group heading="Actions">
            <Command.Item
              value="new property search"
              onSelect={() => runCommand('/requirements')}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>New property search</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  )
}
