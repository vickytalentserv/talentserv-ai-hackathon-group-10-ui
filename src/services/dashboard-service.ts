import { delay } from '@/lib/utils'
import { mockDashboardData } from '@/constants/mock-data'
import type { DashboardData } from '@/types'

export async function fetchDashboardData(): Promise<DashboardData> {
  await delay(800)
  return mockDashboardData
}
