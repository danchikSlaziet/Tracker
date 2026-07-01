import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateTransaction } from '../../api/useTransactions'
import { useCategories } from '@/entities/category/api/useCategories'
import { formSchema, type CreateTransactionFormValues } from '../../model/transactionsSchema'

export const useCreateTransactionForm = (onSuccessCallback?: () => void) => {
  const { mutate: createTransaction, isPending, error: serverError } = useCreateTransaction()
  const { data: categories, isLoading: isCategoriesLoading } = useCategories()

  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedType = form.watch('type')
  const filteredCategories = categories?.filter(
    (cat) => cat.type === selectedType || cat.type === 'both'
  )

  const onSubmit = (data: CreateTransactionFormValues) => {
    createTransaction(
      {
        ...data,
        date: new Date(data.date).toISOString(), // бэкенд ждет ISO
      },
      {
        onSuccess: () => {
          form.reset()
          if (onSuccessCallback) onSuccessCallback()
        },
      }
    )
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    serverError,
    filteredCategories,
    isCategoriesLoading,
  }
}
