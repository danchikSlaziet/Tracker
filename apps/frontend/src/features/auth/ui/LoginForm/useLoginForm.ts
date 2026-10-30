import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from '../../model/loginSchema'
import { useLogin } from '../../api/useLogin'
import { ROUTES } from '@/shared/config'
import { useTelegramAuth } from '../../api/useTelegramAuth'
import type { TelegramAuthData } from '@finance/shared-types'
import { getApiErrorMessage } from '@/shared/api'

export const useLoginForm = () => {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()
  const { mutate: telegramAuth } = useTelegramAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onTelegramSuccess = (user: TelegramAuthData) => {
    telegramAuth(user, {
      onSuccess: () => navigate(ROUTES.HOME),
      onError: (error) => form.setError('root', {
        message: getApiErrorMessage(error, 'Ошибка входа'),
      })
    })
  }

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => navigate(ROUTES.HOME),
      onError: (error) => {
        form.setError('root', {
          message: getApiErrorMessage(error, 'Ошибка входа'),
        })
      },
    })
  }

  return { form, onTelegramSuccess, onSubmit: form.handleSubmit(onSubmit), isPending }
}