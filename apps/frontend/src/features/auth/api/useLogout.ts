import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"
import { logoutApi } from "./authApi";
import { ROUTES } from "@/shared/config";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.clear()
      //очистка кэша tanstack
      navigate(ROUTES.LOGIN)
    },
  })
}