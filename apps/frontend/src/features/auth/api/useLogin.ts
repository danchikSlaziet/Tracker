import { useMutation } from '@tanstack/react-query'
import { loginApi } from './authApi'

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
  })
}