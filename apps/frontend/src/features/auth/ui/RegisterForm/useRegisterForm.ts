import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"
import { useRegister } from "../../api/useRegister";
import { loginSchema, type LoginFormValues } from "../../model/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/shared/config/routes";


export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = (data: LoginFormValues) => {
    register(data, {
      onSuccess: () => navigate(ROUTES.LOGIN),
      onError: (error: any) => form.setError('root', {
        message: error.response?.data?.error ?? 'Ошибка регистрации'
      })
    })
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), isPending };
}