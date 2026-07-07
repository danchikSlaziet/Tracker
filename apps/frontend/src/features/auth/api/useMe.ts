import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'
import type { AuthResponse } from '@finance/shared-types'
import { QUERY_KEYS } from '@/shared/config/queryKeys'

export const useMe = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => httpClient.get<AuthResponse>('/auth/me').then(res => res.data),
    retry: false, // не повторять при 401 unauthorized
    staleTime: 5 * 60 * 1000,
  })
}