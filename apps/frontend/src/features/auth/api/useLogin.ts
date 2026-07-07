import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginApi } from './authApi'
import { QUERY_KEYS } from '@/shared/config/queryKeys'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    }
  })
}