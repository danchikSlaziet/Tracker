import z from "zod"

export const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number({ message: 'Введите сумму' }).positive('Сумма должна быть больше 0'),
  description: z.string().min(1, 'Описание обязательно'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  date: z.string().min(1, 'Дата обязательна'),
})


export type CreateTransactionFormValues = z.infer<typeof formSchema>

export interface TransactionFilters {
  search?: string
  type?: 'income' | 'expense'
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}