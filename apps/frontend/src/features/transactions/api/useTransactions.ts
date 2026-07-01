import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  importTransactions,
  updateTransaction,
} from './transactionsApi'
import type { TransactionFilters } from '../model/transactionsSchema'
import { QUERY_KEYS } from '@/shared/config/queryKeys'
import type { CreateTransactionDto } from '@finance/shared-types'

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

export const useImportTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importTransactions,
    onSuccess: () => {
      // Инвалидируем транзакции и категории (на случай создания категории "Неразобранное")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
    }
  })
}

export const useUpdateTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<CreateTransactionDto> }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
    }
  })
}