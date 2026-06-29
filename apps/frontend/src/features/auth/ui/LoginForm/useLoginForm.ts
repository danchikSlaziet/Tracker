import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from '../../model/loginSchema'
import { useLogin } from '../../api/useLogin'
import { ROUTES } from '@/shared/config/routes'

export const useLoginForm = () => {
    const navigate = useNavigate()
    const { mutate: login, isPending } = useLogin()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginFormValues) => {
        login(data, {
            onSuccess: () => navigate(ROUTES.HOME),
            onError: (error: any) => {
                form.setError('root', {
                    message: error.response?.data?.error ?? 'Ошибка входа',
                })
            },
        })
    }

    return { form, onSubmit: form.handleSubmit(onSubmit), isPending }
}