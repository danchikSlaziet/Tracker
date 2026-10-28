import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50, 'Слишком длинное название'),
  icon: z.string().min(1, 'Иконка обязательна'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Некорректный цвет'),
  type: z.enum(['income', 'expense', 'both']),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>