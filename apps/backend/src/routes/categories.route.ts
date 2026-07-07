import { Router } from 'express'
import { prisma } from '../index'
import { z } from 'zod'

export const categoriesRouter = Router()

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50),
  icon: z.string().min(1, 'Иконка обязательна'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Некорректный цвет (формат #RRGGBB)'),
  type: z.enum(['income', 'expense', 'both']),
})

categoriesRouter.get('/', async (req, res) => {
  const userId = req.userId
  const { onlyDeleted } = req.query

  const isDeleted = onlyDeleted === 'true'

  const categories = await prisma.category.findMany({
    where: {
      userId,
      isDeleted
    },
    orderBy: { name: 'asc' },
  })

  res.json(categories)
})

categoriesRouter.post('/', async (req, res) => {
  const userId = req.userId!
  const parsed = categorySchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const category = await prisma.category.create({
    data: { ...parsed.data, userId },
  })

  res.status(201).json(category)
})


categoriesRouter.put('/:id', async (req, res) => {
  const userId = req.userId
  const { id } = req.params
  const parsed = categorySchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) {
    res.status(404).json({ error: 'Категория не найдена' })
    return
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  })

  res.json(category)
})

categoriesRouter.put('/:id/restore', async(req, res) => {
  const userId = req.userId
  const { id } = req.params

  const existing = await prisma.category.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    res.status(404).json({ error: 'Категория не найдена' })
    return
  }
  const restoredCategory = await prisma.category.update({
    where: { id },
    data: { isDeleted: false }
  })
  res.json(restoredCategory)
})


categoriesRouter.delete('/:id', async (req, res) => {
  const userId = req.userId!
  const { id } = req.params

  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) {
    res.status(404).json({ error: 'Категория не найдена' })
    return
  }

  await prisma.category.update({
    where: { id },
    data: { isDeleted: true }
  })

  res.status(204).send()
})