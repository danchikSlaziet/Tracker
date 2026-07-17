import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  importTransactions,
  updateTransaction,
} from './transactionsApi'
import type { PaginatedResponse } from '@finance/shared-types'
import type { Transaction, CreateTransactionDto } from '@/entities/transaction'
import type { Category } from '@/entities/category'
import type { TransactionFilters } from '../model/transactionsSchema'
import { QUERY_KEYS } from '@/shared/config'
import type { InfiniteData } from '@tanstack/react-query'

type TransactionCache = PaginatedResponse<Transaction> | InfiniteData<PaginatedResponse<Transaction>>


// для дашборда
export const useTransactions = (filters?: TransactionFilters) => {

  const hasActiveFilters = filters && Object.values(filters).some(val => val !== undefined && val !== '')
  const normalizedFilters = hasActiveFilters ? filters : undefined // {} !== undefined для танстака, думает что надо обновить кэш

  return useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, normalizedFilters],
    queryFn: () => getTransactions(normalizedFilters),
    select: (response) => response.data
  })
}

export const useInfiniteTransactions = (filters?: TransactionFilters, limit = 20) => {

  const hasActiveFilters = filters && Object.values(filters).some(val => val !== undefined && val !== '')
  const normalizedFilters = hasActiveFilters ? filters : undefined

  return useInfiniteQuery({
    // передаем фильтры и лимит, чтобы кэш инвалидировался при их изменении
    queryKey: [...QUERY_KEYS.TRANSACTIONS, 'infinite', normalizedFilters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getTransactions({ ...normalizedFilters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,

    onMutate: async (newTxDto) => {

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      const snapshot = queryClient.getQueriesData<Transaction[]>({ queryKey: QUERY_KEYS.TRANSACTIONS })
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

      queryClient.setQueriesData<TransactionCache>(
        { queryKey: QUERY_KEYS.TRANSACTIONS },
        (old) => {
          if (!old) return old

          // для пагинации: infinte query
          if ('pages' in old) {
            return {
              ...old,
              pages: old.pages.map((page, idx) =>
                idx === 0 ? { ...page, data: [tempTransaction, ...page.data] } : page
              )
            }
          }

          // для дашборда: обычная структура пагинации 
          if ('data' in old) {
            return {
              ...old,
              data: [tempTransaction, ...old.data]
            }
          }

          return old
        }
      )
      // контекст для отката
      return { snapshot }
    },

    onError: (_err, _newTx, context) => {
      if (context?.snapshot) {
        context.snapshot.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
    }
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTransaction,

    onMutate: async (id: string) => {

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      // сохранили кэш для отката
      const snapshot = queryClient.getQueriesData<Transaction[]>({ queryKey: QUERY_KEYS.TRANSACTIONS })

      queryClient.setQueriesData<TransactionCache>(
        { queryKey: QUERY_KEYS.TRANSACTIONS },
        (old) => {
          if (!old) return old

          // для пагинации: infinte query
          if ('pages' in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((t) => t.id !== id)
              }))
            }
          }

          // для дашборда: обычная структура пагинации 
          if ('data' in old) {
            return {
              ...old,
              data: old.data.filter((t) => t.id !== id)
            }
          }

          return old
        }
      )

      return { snapshot }
    },

    onError: (_err, _id, context) => {
      // откат к кэшу
      context?.snapshot.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSettled: () => { // finally
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