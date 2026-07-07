import { httpClient } from '@/shared/api'
import type { AuthResponse, LoginDto, TelegramAuthData } from '@finance/shared-types'

export const loginApi = (data: LoginDto) => httpClient.post<AuthResponse>('/auth/login', data)
export const registerApi = (data: LoginDto) => httpClient.post<AuthResponse>('/auth/register', data)
export const logoutApi = () => httpClient.post('/auth/logout')

export const verifyOtp = (data: {email: string, code: string}) => httpClient.post<AuthResponse>('/auth/verify-otp', data).then(res => res.data)
export const resendOtp = (data: Omit<LoginDto, 'password'>) => httpClient.post<{message: string}>('/auth/resend-otp', data).then(res => res.data)

export const telegramAuthApi = (data: TelegramAuthData) => httpClient.post<AuthResponse>('/auth/telegram', data).then(res => res.data)