import { httpClient } from '@/shared/api'
import type { AuthResponse, LoginDto } from '@finance/shared-types'

export const loginApi = (data: LoginDto) => httpClient.post<AuthResponse>('/auth/login', data)
export const registerApi = (data: LoginDto) => httpClient.post<AuthResponse>('/auth/register', data)
export const logoutApi = () => httpClient.post('/auth/logout')