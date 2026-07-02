import { httpClient } from "@/shared/api"
import type { AuthResponse } from "@finance/shared-types"

export const uploadAvatarUrl = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)

  return httpClient.post<AuthResponse>('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }).then(res => res.data)
}

export const deleteAvatarUrl = () => {
  return httpClient.delete<AuthResponse>('/user/avatar').then(res => res.data)
}