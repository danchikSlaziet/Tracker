import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../index'
import type { UserDto } from '@finance/shared-types'



export const userRouter = Router()

// Настройка хранилища multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'))
  },
  filename: (req, file, cb) => {
    // Безопасное имя файла: префикс + ID юзера + таймстемп
    const uniqueSuffix = `${req.userId}-${Date.now()}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `avatar-${uniqueSuffix}${ext}`)
  },
})

// Настройка загрузчика с валидацией типа и размера
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Недопустимый формат файла. Разрешены только JPEG, PNG и WEBP.'))
    }
  },
})


userRouter.post('/avatar', (req, res) => {

  // вызываем multer вручную для перехвата ошибок (а то не обработаем ошибки мультера)
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не выбран' })
    }

    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    try {
      // проверяем наличие старого аватара
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      if (user.avatarUrl) {
        const oldFileName = user.avatarUrl.replace('/api/uploads/', '').replace('/uploads/', '')
        const oldFilePath = path.join(process.cwd(), 'uploads', oldFileName)
        // .catch(() => {}) нужен, чтобы сервер не упал, если файл уже был удален вручную
        await fs.unlink(oldFilePath).catch(() => { })
      }

      const avatarUrl = `/api/uploads/${req.file.filename}`

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      })

      const responseUser: UserDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        avatarUrl: updatedUser.avatarUrl,
      }

      return res.json({ user: responseUser })
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error)
      return res.status(500).json({ error: 'Ошибка сервера при сохранении аватара' })
    }
  })
})


userRouter.delete('/avatar', async (req, res): Promise<any> => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (user.avatarUrl) {
      const fileName = user.avatarUrl.replace('/api/uploads/', '').replace('/uploads/', '')
      const filePath = path.join(process.cwd(), 'uploads', fileName)
      await fs.unlink(filePath).catch(() => { })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    })

    const responseUser: UserDto = {
      id: updatedUser.id,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      avatarUrl: updatedUser.avatarUrl,
    }

    return res.json({ user: responseUser })
  } catch (error) {
    console.error('Ошибка при удалении аватара:', error)
    return res.status(500).json({ error: 'Ошибка сервера при удалении аватара' })
  }
})
