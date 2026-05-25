import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/store/app-store'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import {
  RequirementsPage,
  RecommendationsPage,
  ReportsPage,
} from '@/pages/PlaceholderPages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="analytics/*" element={<AnalyticsPage />} />
                <Route path="requirements" element={<RequirementsPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'border-border bg-card text-foreground shadow-elevated',
              },
            }}
          />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  )
}
