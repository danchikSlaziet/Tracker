import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAvatarUrl, uploadAvatarUrl } from "./profileApi"
import { QUERY_KEYS } from "@/shared/config/queryKeys"

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadAvatarUrl,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
  })
}

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAvatarUrl,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
  })
}