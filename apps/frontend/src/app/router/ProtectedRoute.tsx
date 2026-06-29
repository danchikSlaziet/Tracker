import { Navigate, Outlet } from 'react-router-dom'
import { useMe } from '@/features/auth/api/useMe'
import { PageLoader } from '@/shared/ui'
import { ROUTES } from '@/shared/config/routes'

export function ProtectedRoute() {
  const { isLoading, isError } = useMe()

  if (isLoading) return <PageLoader />
  if (isError) return <Navigate to={ROUTES.LOGIN} replace />

  return <Outlet />
}