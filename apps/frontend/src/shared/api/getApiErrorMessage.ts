import { isAxiosError } from 'axios'
import type { ApiErrorResponse } from '@finance/shared-types'

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? fallback
  }
  return fallback
}