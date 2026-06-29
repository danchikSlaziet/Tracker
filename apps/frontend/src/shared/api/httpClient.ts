import axios from 'axios'
import { ROUTES } from '../config/routes'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = window.location.pathname === ROUTES.LOGIN ||
      window.location.pathname === ROUTES.REGISTER

    if (error.response?.status === 401 && !isAuthRoute) {
      window.location.href = ROUTES.LOGIN
    }
    return Promise.reject(error)
  }
)

