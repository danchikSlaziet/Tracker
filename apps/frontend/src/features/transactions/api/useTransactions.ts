import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from './transactionsApi'
import type { TransactionFilters } from '../model/transactionsSchema'
import { QUERY_KEYS } from '@/shared/config/queryKeys'

export const useTransactions = (filters?: TransactionFilters) => {

  const hasActiveFilters = filters && Object.values(filters).some(val => val !== undefined && val !== '')
  const normalizedFilters = hasActiveFilters ? filters : undefined // {} !== undefined для танстака, думает что надо обновить кэш

  return useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, normalizedFilters],
    queryFn: () => getTransactions(normalizedFilters),
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRANSACTIONS,
      })
    }
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
    },
  })
}