import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/widgets/Layout'
import { lazy, Suspense, useEffect } from 'react'
import { PageLoader } from '@finance/ui-kit'
import { ROUTES } from '@/shared/config'
import { ProtectedRoute } from './ProtectedRoute'
import { useThemeStore } from '@/shared/lib/useThemeStore'
import { VerifyPage } from '@/pages/Verify'


// лень))
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then(m => ({ default: m.DashboardPage }))
)
const LoginPage = lazy(() =>
  import('@/pages/Login').then(m => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@/pages/Register').then(m => ({ default: m.RegisterPage }))
)
const CategoriesPage = lazy(() =>
  import('@/pages/Categories').then(m => ({ default: m.CategoriesPage }))
)
const TransactionsPage = lazy(() =>
  import('@/pages/Transactions').then(m => ({ default: m.TransactionsPage }))
)

function ThemeProvider() {
  const { theme } = useThemeStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return null
}


export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ThemeProvider />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.VERIFY} element={<VerifyPage />} />
          <Route element={
            <Layout />
          }>
            <Route path={ROUTES.HOME} element={<DashboardPage />} />
            <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
            <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
