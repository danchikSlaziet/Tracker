import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../index'
import { config } from '../config'
import { authMiddleware } from '../middleware/auth.middleware'
import type { AuthResponse, UserDto } from '@finance/shared-types'

export const authRouter = Router()

const authBodySchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
})

const SALT_ROUNDS = 12


authRouter.post('/register', async (req, res): Promise<any> => {
  // Валидируем тело запроса
  const parsed = authBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const { email, password } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      categories: {
        create: [
          { name: 'Продукты', icon: '🛒', color: '#3b82f6', type: 'expense' },
          { name: 'Транспорт', icon: '🚌', color: '#f59e0b', type: 'expense' },
          { name: 'Зарплата', icon: '💰', color: '#10b981', type: 'income' },
          { name: 'Развлечения', icon: '🍿', color: '#8b5cf6', type: 'expense' }
        ]
      }
    },
  })

  const responseUser: UserDto = { id: user.id, email: user.email }
  const response: AuthResponse = { user: responseUser }

  return res.status(201).json(response)
})


authRouter.post('/login', async (req, res): Promise<any> => {
  // Валидируем тело запроса
  const parsed = authBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  const responseUser: UserDto = { id: user.id, email: user.email }
  const response: AuthResponse = { user: responseUser }

  return res.json(response)
})


authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(200).json({ message: 'Успешный выход' })
})


authRouter.get('/me', authMiddleware, async (req, res): Promise<any> => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })

  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден' })
  }

  const responseUser: UserDto = { id: user.id, email: user.email }
  const response: AuthResponse = { user: responseUser }

  return res.json(response)
})