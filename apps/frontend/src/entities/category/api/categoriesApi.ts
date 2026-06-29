import { httpClient } from '@/shared/api'
import type { Category } from '@finance/shared-types'
import type { CategoriesFilter } from '../model/CategoryFilter'

export interface CreateCategoryDto {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export const getCategories = (filters?: CategoriesFilter) =>
  httpClient.get<Category[]>('/categories', {
    params: filters,
  }).then(res => res.data)

export const createCategory = (data: CreateCategoryDto) =>
  httpClient.post<Category>('/categories', data).then(res => res.data)

export const updateCategory = (id: string, data: CreateCategoryDto) =>
  httpClient.put<Category>(`/categories/${id}`, data).then(res => res.data)

export const restoreCategory = (id: string) => 
  httpClient.put(`/categories/${id}/restore`).then(res => res.data)

export const deleteCategory = (id: string) =>
  httpClient.delete(`/categories/${id}`).then(res => res.data)