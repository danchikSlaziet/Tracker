import { httpClient } from '@/shared/api'
import type { Transaction, CreateTransactionDto } from '@finance/shared-types'
import type { TransactionFilters } from '../model/transactionsSchema'

export const getTransactions = (filters?: TransactionFilters) =>
  httpClient.get<Transaction[]>('/transactions', {
    params: filters,
  }).then(res => res.data)

export const createTransaction = (data: CreateTransactionDto) =>
  httpClient.post<Transaction>('/transactions', data).then(res => res.data)

export const deleteTransaction = (id: string) =>
  httpClient.delete(`/transactions/${id}`).then(res => res.data)

export const importTransactions = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return httpClient.post<{ message: string; importedCount: number }>('/transactions/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data)
}

export const updateTransaction = (id: string, data: Partial<CreateTransactionDto>) =>
  httpClient.patch<Transaction>(`/transactions/${id}`, data).then(res => res.data)