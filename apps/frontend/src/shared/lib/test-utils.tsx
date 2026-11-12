import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { type ReactElement } from 'react'
import { AxiosError, type AxiosResponse } from 'axios'

// Создаем свежий QueryClient для КАЖДОГО теста, 
// чтобы кэш из одного теста не ломал другой
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // отключаем автоматические повторы запросов для тестов
    },
  },
})

export const createApiError = (message: string, status = 400) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: message },
    status,
  } as AxiosResponse)

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