import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { categoryFormSchema, type CategoryFormValues } from '../../model/categorySchema'

const defaultValues: CategoryFormValues = {
  name: '',
  icon: '📦',
  color: '#3b82f6',
  type: 'expense',
}

export const useCategoryForm = (initialData?: CategoryFormValues) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData || defaultValues,
  })

  // есть редактирование/создание категории ==>
  useEffect(() => {
    form.reset(initialData || defaultValues)
  }, [initialData, form])

  return form
}