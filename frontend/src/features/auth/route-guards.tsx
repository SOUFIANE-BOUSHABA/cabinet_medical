import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getDashboardPath, getLoginPath } from '@/features/auth/auth-routing'
import { useAuth } from '@/features/auth/use-auth'
import { FullPageLoader } from '@/features/auth/ui/full-page-loader'
import type { PrincipalType, UserRole } from '@/types/auth'

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { status, user } = useAuth()
  if (status === 'loading') return <FullPageLoader />
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />
  return children
}

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  portal: PrincipalType
}

export function ProtectedRoute({ allowedRoles, portal }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (!user) {
    return (
      <Navigate
        to={getLoginPath(portal)}
        state={{ from: location.pathname }}
        replace
      />
    )
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
