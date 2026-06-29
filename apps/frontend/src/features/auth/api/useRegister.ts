import { useMutation } from "@tanstack/react-query"
import { registerApi } from "./authApi"


export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi
  })
}