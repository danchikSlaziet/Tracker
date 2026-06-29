import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategory, deleteCategory, getCategories, restoreCategory, updateCategory, type CreateCategoryDto } from "./categoriesApi"
import type { CategoriesFilter } from "../model/CategoryFilter"
import { QUERY_KEYS } from "@/shared/config/queryKeys"

export const useCategories = (filter?: CategoriesFilter) => {
  const normalizedFilter = filter?.onlyDeleted ? filter : undefined // чтобы не мешались два одинаковых запроса без квери и с onlyDeleted: false, танстак думает что кэш надо обновить

  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, normalizedFilter],
    queryFn: () => getCategories(normalizedFilter)
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CATEGORIES
    })
  })
}

export const useRestoreCategory = () => {
  const queryClinet = useQueryClient()
  return useMutation({
    mutationFn: restoreCategory,
    onSuccess: () => queryClinet.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryDto }) => // по дефолту без указания tanstack 1 аргумент передает
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES }),
  })
}