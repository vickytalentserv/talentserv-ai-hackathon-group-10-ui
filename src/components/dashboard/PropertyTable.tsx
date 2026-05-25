import type { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, MoreHorizontal, Minus } from 'lucide-react'
import type { PropertyRecord } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SortableHeader } from '@/components/tables/DataTable'

const statusLabels: Record<PropertyRecord['status'], { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  ready: { label: 'Ready', variant: 'success' },
  under_construction: { label: 'Under Construction', variant: 'warning' },
  resale: { label: 'Resale', variant: 'secondary' },
}

export const propertyColumns: ColumnDef<PropertyRecord>[] = [
  {
    accessorKey: 'title',
    header: () => <SortableHeader label="Property" />,
    cell: ({ row }) => (
      <div className="min-w-[200px]">
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.builder}</p>
      </div>
    ),
  },
  {
    accessorKey: 'locality',
    header: () => <SortableHeader label="Locality" />,
    cell: ({ row }) => (
      <span>
        {row.original.locality}, {row.original.city}
      </span>
    ),
  },
  {
    accessorKey: 'bhk',
    header: () => <SortableHeader label="BHK" />,
    cell: ({ row }) => <span>{row.original.bhk} BHK</span>,
  },
  {
    accessorKey: 'price',
    header: () => <SortableHeader label="Price" />,
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.price, true)}</span>
    ),
  },
  {
    accessorKey: 'area',
    header: () => <SortableHeader label="Area" />,
    cell: ({ row }) => <span>{row.original.area} sq.ft.</span>,
  },
  {
    accessorKey: 'status',
    header: () => <SortableHeader label="Status" />,
    cell: ({ row }) => {
      const config = statusLabels[row.original.status]
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'sentiment',
    header: () => <SortableHeader label="Sentiment" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${row.original.sentiment}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{row.original.sentiment}</span>
      </div>
    ),
  },
  {
    accessorKey: 'trend',
    header: () => <SortableHeader label="Trend" />,
    cell: ({ row }) => {
      const trend = row.original.trend
      const Icon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
      return (
        <span
          className={
            trend === 'up'
              ? 'text-success'
              : trend === 'down'
                ? 'text-destructive'
                : 'text-muted-foreground'
          }
        >
          <Icon className="h-4 w-4" />
        </span>
      )
    },
  },
  {
    accessorKey: 'source',
    header: () => <SortableHeader label="Source" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.source}</Badge>,
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Compare</DropdownMenuItem>
          <DropdownMenuItem>Add to shortlist</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
