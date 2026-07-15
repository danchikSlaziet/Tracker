import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { authRouter } from './routes/auth.route'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from './middleware/auth.middleware'
import { transactionsRouter } from './routes/transaction.route'
import { categoriesRouter } from './routes/categories.route'
import path from 'path'
import fs from 'fs'
import { userRouter } from './routes/user.route'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { parseCookie } from 'cookie'

// ебучее подключение к бд в 7-ой Призме
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const app = express()
app.set('trust proxy', 1)
export const prisma = new PrismaClient({ adapter }) // для общения с базой

// --- Мидлвары ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // разрешает загрузку картинок на фронтенде с бэкенда
  })
)
app.use(express.json()) // Чтобы Express умел читать JSON из req.body
app.use(cookieParser()) // Чтобы Express умел читать куки из req.cookies


app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // передача httpOnly куки
  })
)

// Создаем папку для аватаров, если её ещё нет
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
// Раздаем статику с поддержкой CORS, чтобы фронт мог скачать картинку
app.use('/api/uploads', cors(), express.static(uploadsDir))


// --- РОУТЫ ---

// пинг сервака на проверку его смерти
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                   // максимум 100 запросов с одного IP за окно
  message: { error: 'Слишком много попыток, попробуйте позже' },
})

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/transactions', authMiddleware, transactionsRouter)
app.use('/api/categories', authMiddleware, categoriesRouter)
app.use('/api/user', authMiddleware, userRouter)

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }
})

app.set('io', io)

// мидлвара для проверки авторизации при первом коннекте
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie

  if (!cookieHeader) {
    console.log('Socket Auth: Нет кук в заголовках запроса')
    return next(new Error('Authentication error: No cookies found'))
  }

  const cookies = parseCookie(cookieHeader)
  const token = cookies.token

  if (!token) {
    console.log('Socket Auth: Кука token отсутствует')
    return next(new Error('Authentication error: Token not found'))
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    socket.data.userId = payload.userId
    next()
  } catch (error) {
    console.log('Socket Auth: Ошибка верификации JWT токена:', (error as any).message)
    next(new Error('Authentication error: Invalid token'))
  }
})


io.on('connection', (socket) => {
  const userId = socket.data.userId
  console.log(`Пользователь ${userId} подключился к WebSocket`)

  // Присоединяем к комнате
  socket.join(`user:${userId}`)

  socket.on('disconnect', () => {
    console.log(`Пользователь ${userId} отключился от WebSocket`)
  })
})


const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`)
})