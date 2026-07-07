import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"
import { useRegister } from "../../api/useRegister";
import { loginSchema, type LoginFormValues } from "../../model/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/shared/config/routes";
import { useTelegramAuth } from "../../api/useTelegramAuth";
import type { TelegramAuthData } from "@finance/shared-types";


export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister()
  const { mutate: telegramAuth } = useTelegramAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onTelegramSuccess = (user: TelegramAuthData) => {
    telegramAuth(user, {
      onSuccess: () => navigate(ROUTES.HOME),
      onError: (error: any) => form.setError('root', {
        message: error.response?.data?.error ?? 'Ошибка регистрации через Telegram',
      })
    })
  }


  const onSubmit = (data: LoginFormValues) => {
    register(data, {
      onSuccess: () => navigate(ROUTES.HOME),
      onError: (error: any) => form.setError('root', {
        message: error.response?.data?.error ?? 'Ошибка регистрации'
      })
    })
  }

  return { form, onTelegramSuccess, onSubmit: form.handleSubmit(onSubmit), isPending };
}