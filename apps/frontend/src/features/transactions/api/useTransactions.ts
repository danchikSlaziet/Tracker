import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  importTransactions,
  updateTransaction,
} from './transactionsApi'
import type { CreateTransactionDto, Transaction, Category } from '@finance/shared-types'
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
    onMutate: async (newTxDto) => {
      // отменяем активные запросы,
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })

      const previousTransactions = queryClient.getQueriesData<Transaction[]>({
        queryKey: QUERY_KEYS.TRANSACTIONS,
      })

      const categories = queryClient.getQueryData<Category[]>([...QUERY_KEYS.CATEGORIES, undefined]) // в квери кей у категорий есть еще normalizedFilter (queryKey: [...QUERY_KEYS.CATEGORIES, normalizedFilter])
      const matchedCategory = categories?.find((c) => c.id === newTxDto.categoryId) || {
        id: newTxDto.categoryId,
        name: 'Загрузка...',
        icon: '🔄',
        color: '#ccc',
        type: newTxDto.type,
      }

      // временный объект транзакции
      const tempTransaction: Transaction = {
        id: `temp-id-${Date.now()}`,
        createdAt: new Date().toISOString(),
        category: matchedCategory,
        ...newTxDto,
      }

      queryClient.setQueriesData<Transaction[]>(
        { queryKey: QUERY_KEYS.TRANSACTIONS },
        (old) => (old ? [tempTransaction, ...old] : [tempTransaction])
      )

      // контекст для отката
      return { previousTransactions }
    },

    onError: (_err, _newTx, context) => {
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },
    // finally
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
    },
  })
}


export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id: string) => {
      // отменяем активные запросы
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })

      const previousTransactions = queryClient.getQueriesData<Transaction[]>({
        queryKey: QUERY_KEYS.TRANSACTIONS,
      })

      queryClient.setQueriesData<Transaction[]>(
        { queryKey: QUERY_KEYS.TRANSACTIONS },
        (old) => (old ? old.filter((t) => t.id !== id) : [])
      )
      // контекст для отката
      return { previousTransactions }
    },

    onError: (_err, _id, context) => {
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },
    // finally
    onSettled: () => {
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