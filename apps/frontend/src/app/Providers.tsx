import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { ErrorFallback } from '@/shared/ui/ErrorFallback'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 мин храним кэш
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  )
}