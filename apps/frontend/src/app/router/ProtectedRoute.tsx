import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '@/features/auth/api/useMe'
import { PageLoader } from '@finance/ui-kit'
import { ROUTES } from '@/shared/config/routes'

export function ProtectedRoute() {
  const { data, isLoading, isError } = useMe()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (isError || !data?.user) return <Navigate to={ROUTES.LOGIN} replace />

  if (!data.user.isVerified && location.pathname !== ROUTES.VERIFY) {
    return <Navigate to={ROUTES.VERIFY} replace />
  }

  // Защита от дурака: если верифицирован, но лезет на /verify -> на главную
  if (data.user.isVerified && location.pathname === ROUTES.VERIFY) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}