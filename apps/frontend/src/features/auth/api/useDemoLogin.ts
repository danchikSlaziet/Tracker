import { useMutation, useQueryClient } from '@tanstack/react-query'
import { demoLoginApi } from './authApi'
import { QUERY_KEYS } from '@/shared/config'

export const useDemoLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: demoLoginApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    },
  })
}