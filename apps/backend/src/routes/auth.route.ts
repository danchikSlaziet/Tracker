import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Resend } from 'resend'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth.middleware'
import type { AuthResponse, UserDto } from '@finance/shared-types'
import { verifyTelegramHash } from '../lib/verifyTelegramHash'
import type { TelegramAuthData } from '@finance/shared-types'

export const authRouter = Router()

const resend = new Resend(process.env.RESEND_API_KEY)

const authBodySchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
})

const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
})

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const sendVerificationEmail = async (email: string, otpCode: string) => {
  try {
    await resend.emails.send({
      from: 'Finance App <noreply@finance67.ru>',
      to: email,
      subject: 'Код подтверждения регистрации',
      html: `<p>Твой код для подтверждения email:</p><h2>${otpCode}</h2><p>Код действителен 15 минут.</p>`
    })
  } catch (error) {
    console.error('Ошибка отправки email:', error)
  }
}

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
    if (existingUser.isVerified) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
    } else {
      // защита от рега на чужую почту неподтвержденную
      await prisma.transaction.deleteMany({ where: { userId: existingUser.id } })
      await prisma.category.deleteMany({ where: { userId: existingUser.id } })
      await prisma.user.delete({ where: { id: existingUser.id } })
    }
  }


  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // через 15 мин

  const isTestUser = email.startsWith('e2e-user-') && email.endsWith('@test.com')
  const otpCode = isTestUser ? '123456' : generateOTP()

  const user = await prisma.user.create({
    data: {
      email,
      otpCode,
      otpExpiresAt,
      passwordHash,
      categories: {
        create: [
          { name: 'Продукты', icon: '🛒', color: '#3b82f6', type: 'expense' },
          { name: 'Транспорт', icon: '🚌', color: '#f59e0b', type: 'expense' },
          { name: 'Зарплата', icon: '💰', color: '#10b981', type: 'income' },
          { name: 'Развлечения', icon: '🍿', color: '#8b5cf6', type: 'expense' },
          { name: 'Переводы', icon: '💸', color: '#ec4899', type: 'both' }
        ]
      }
    },
  })

  if (!isTestUser) {
    sendVerificationEmail(user.email, otpCode)
  }

  const responseUser: UserDto = { id: user.id, email: user.email, isVerified: user.isVerified, avatarUrl: user.avatarUrl, telegramId: user.telegramId }
  const response: AuthResponse = { user: responseUser }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '7d' })
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

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

  // зареган через Telegram
  if (!user.passwordHash) {
    return res.status(400).json({ error: 'Для этого аккаунта настроен вход через Telegram' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  const responseUser: UserDto = { id: user.id, email: user.email, isVerified: user.isVerified, avatarUrl: user.avatarUrl, telegramId: user.telegramId }
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
    select: { id: true, email: true, isVerified: true, avatarUrl: true, telegramId: true },
  })

  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден' })
  }

  const responseUser: UserDto = { id: user.id, email: user.email, isVerified: user.isVerified, avatarUrl: user.avatarUrl, telegramId: user.telegramId }
  const response: AuthResponse = { user: responseUser }

  return res.json(response)
})

const verifyOtpSchema = z.object({
  email: z.string().email('Некорректный email'),
  code: z.string().length(6, 'Код должен состоять из 6 цифр'),
})
const resendOtpSchema = z.object({
  email: z.string().email('Некорректный email'),
})

authRouter.post('/verify-otp', async (req, res): Promise<any> => {
  const parsed = verifyOtpSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const { email, code } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' })
  }
  if (user.isVerified) {
    return res.status(400).json({ error: 'Email уже подтвержден' })
  }

  if (user.otpCode !== code) {
    return res.status(400).json({ error: 'Неверный код подтверждения' })
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ error: 'Код устарел, запросите новый' })
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    }
  })

  const responseUser: UserDto = { id: updatedUser.id, email: updatedUser.email, isVerified: updatedUser.isVerified, avatarUrl: updatedUser.avatarUrl, telegramId: updatedUser.telegramId }
  return res.json({ user: responseUser })
})


authRouter.post('/resend-otp', async (req, res): Promise<any> => {
  const parsed = resendOtpSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' })
  }
  if (user.isVerified) {
    return res.status(400).json({ error: 'Email уже подтвержден' })
  }

  const otpCode = generateOTP()
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode, otpExpiresAt }
  })

  sendVerificationEmail(user.email, otpCode)

  return res.json({ message: 'Новый код отправлен на почту' })
})

authRouter.post('/telegram', async (req, res): Promise<any> => {

  const parsed = telegramAuthSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Некорректные данные от Telegram' })
  }

  const telegramData = parsed.data as TelegramAuthData

  if (!verifyTelegramHash(telegramData, process.env.TELEGRAM_BOT_TOKEN || '')) {
    return res.status(401).json({ error: 'Невалидная подпись данных Telegram' })
  }

  const telegramId = String(telegramData.id)

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId },
    })

    if (!user) {
      // генерим уникальное техническое мыло
      const email = `tg_${telegramId}@telegram.user`

      user = await prisma.user.create({
        data: {
          email,
          telegramId,
          isVerified: true,
          avatarUrl: telegramData.photo_url ?? null,
          categories: {
            create: [
              { name: 'Продукты', icon: '🛒', color: '#3b82f6', type: 'expense' },
              { name: 'Транспорт', icon: '🚌', color: '#f59e0b', type: 'expense' },
              { name: 'Зарплата', icon: '💰', color: '#10b981', type: 'income' },
              { name: 'Развлечения', icon: '🍿', color: '#8b5cf6', type: 'expense' },
              { name: 'Переводы', icon: '💸', color: '#ec4899', type: 'both' }
            ],
          },
        },
      })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    const responseUser: UserDto = {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl,
      telegramId: user.telegramId,
    }

    return res.json({ user: responseUser })
  } catch (error) {
    console.error('Ошибка авторизации через Telegram:', error)
    return res.status(500).json({ error: 'Внутренняя ошибка сервера при авторизации' })
  }
})