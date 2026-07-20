import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'

function ErrorFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2>Упс! Что-то пошло не так.</h2>
      <p>Произошла непредвиденная ошибка. Мы уже работаем над её устранением.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: '#white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '10px'
        }}
      >
        Обновить страницу
      </button>
    </div>
  )
}

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