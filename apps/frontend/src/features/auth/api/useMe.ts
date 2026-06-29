import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'
import type { AuthResponse } from '@finance/shared-types'

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => httpClient.get<AuthResponse>('/auth/me').then(res => res.data),
    retry: false, // не повторять при 401 unauthorized
    staleTime: 5 * 60 * 1000,
  })
}