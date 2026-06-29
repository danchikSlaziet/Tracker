import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'

export const transactionsRouter = Router()


const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Сумма должна быть больше нуля'),
  description: z.string().min(1, 'Описание не может быть пустым'),
  categoryId: z.string().uuid('Некорректный ID категории'),
  date: z.string().datetime(), // ISO-строкa
})


transactionsRouter.get('/', async (req, res) => {
  const userId = req.userId
  const { type, categoryId, dateFrom, dateTo, search } = req.query

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(type ? { type: type as 'income' | 'expense' } : {}),
      ...(categoryId ? { categoryId: categoryId as string } : {}),
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom ? { gte: new Date(dateFrom as string) } : {}),
          ...(dateTo ? { lte: new Date(dateTo as string) } : {}),
        }
      } : {}),
      ...(search ? {
        description: {
          contains: search as string,
          mode: 'insensitive' // lowerCase == upperCase
        }
      } : {})
    },
    orderBy: { date: 'desc' },
    include: { category: true },
  })

  res.json(transactions)
})



transactionsRouter.post('/', async (req, res) => {
  const userId = req.userId
  const parsed = createTransactionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const data = parsed.data

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  })
  if (!category || category.userId !== userId) {
    res.status(403).json({ error: 'Категория не найдена или недоступна' })
    return
  }
  const newTransaction = await prisma.transaction.create({
    data: {
      type: data.type,
      amount: Math.round(data.amount * 100), // в копейках
      description: data.description,
      date: new Date(data.date), // переводим в ISO
      categoryId: data.categoryId,
      userId,
    },
    include: { category: true },
  })
  res.status(201).json(newTransaction)
})

transactionsRouter.delete('/:id', async (req, res) => {
  const userId = req.userId
  const transactionId = req.params.id

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })
  if (!transaction || transaction.userId !== userId) {
    res.status(403).json({ error: 'Транзакция не найдена или нет прав на удаление' })
    return
  }
  await prisma.transaction.delete({
    where: { id: transactionId }
  })
  res.status(200).json({ message: 'Транзакция удалена' })
})