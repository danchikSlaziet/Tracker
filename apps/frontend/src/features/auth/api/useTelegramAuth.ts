import { useMutation, useQueryClient } from "@tanstack/react-query"
import { telegramAuthApi } from "./authApi"
import { QUERY_KEYS } from "@/shared/config/queryKeys"

export const useTelegramAuth = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: telegramAuthApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    }
  })
}