import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyOtp, resendOtp } from '../../api/authApi'
import { useMe } from '../../api/useMe'
import { ROUTES } from '@/shared/config/routes'
import { verifySchema, type VerifyFormValues } from '../../model/verifySchema'
import { useLogout } from '../../api/useLogout'

export const useVerifyForm = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useMe()
  const email = data?.user?.email || ''

  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => verifyOtp({ email, code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate(ROUTES.HOME, { replace: true })
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => resendOtp({ email }),
    onSuccess: (res) => {
      setResendStatus(res.message)
      setTimeout(() => setResendStatus(null), 5000)
    },
  })

  const logoutMutation = useLogout()

  const onSubmit = (values: VerifyFormValues) => {
    verifyMutation.mutate(values.code)
  }

  const handleResend = () => {
    resendMutation.mutate()
  }

  const handleLogout = () => logoutMutation.mutate()

  return {
    email,
    register,
    handleSubmit,
    onSubmit,
    errors,
    verifyMutation,
    resendMutation,
    handleResend,
    resendStatus,
    handleLogout,
    isLoggingOut: logoutMutation.isPending
  }
}