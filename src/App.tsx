import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { SavedPage } from '@/pages/SavedPage'
import { DataUploadPage } from '@/pages/DataUploadPage'
import { ComparePage } from '@/pages/ComparePage'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <PropertiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:propertyId"
        element={
          <ProtectedRoute>
            <PropertyDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare"
        element={
          <ProtectedRoute>
            <ComparePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <DataUploadPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
