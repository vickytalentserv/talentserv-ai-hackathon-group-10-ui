import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

function AuthLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return <AuthLoading message="Loading…" />
  }

  if (!isAuthenticated) {
    void loginWithRedirect({ appState: { returnTo: '/dashboard' } })
    return <AuthLoading message="Redirecting to login…" />
  }

  return <>{children}</>
}
