import { useQuery } from '@tanstack/react-query'
import { fetchDashboardData } from '@/services/dashboard-service'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 60_000,
  })
}
