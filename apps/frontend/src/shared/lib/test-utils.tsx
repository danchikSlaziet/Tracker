import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { type ReactElement } from 'react'

// Создаем свежий QueryClient для КАЖДОГО теста, 
// чтобы кэш из одного теста не ломал другой
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // отключаем автоматические повторы запросов для тестов
    },
  },
})

export const renderWithProviders = (
  ui: ReactElement,
  options?: { route?: string }
) => {
  const route = options?.route || '/'
  const queryClient = createTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      {/* имитируем роутер */}
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  )
}