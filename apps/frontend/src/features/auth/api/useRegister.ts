import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerApi } from "./authApi"
import { QUERY_KEYS } from "@/shared/config"


export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    }
  })
}