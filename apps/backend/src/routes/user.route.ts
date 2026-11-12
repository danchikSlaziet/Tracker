import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../index'
import type { UserDto } from '@finance/shared-types'



export const userRouter = Router()

const AVATAR_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const detectAvatarExtension = async (file: Buffer) => {
  const { fileTypeFromBuffer } = await import('file-type')
  const detected = await fileTypeFromBuffer(file)
  if (!detected) return null
  return AVATAR_EXTENSIONS[detected.mime] ?? null
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (AVATAR_EXTENSIONS[file.mimetype]) {
      cb(null, true)
      return
    }
    cb(new Error('Недопустимый формат файла. Разрешены только JPEG, PNG и WEBP.'))
  },
})


userRouter.post('/avatar', (req, res) => {

  // вызываем multer вручную для перехвата ошибок (а то не обработаем ошибки мультера)
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Размер файла превышает 5 МБ'
        : err.message
      return res.status(400).json({ error: message })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не выбран' })
    }

    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' })
    }
    if (!req.file.buffer) {
      return res.status(400).json({ error: 'Файл не выбран' })
    }

    const ext = await detectAvatarExtension(req.file.buffer)
    if (!ext) {
      return res.status(400).json({ error: 'Файл не является изображением JPEG, PNG или WEBP' })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      const filename = `avatar-${userId}-${Date.now()}${ext}`
      const filePath = path.join(process.cwd(), 'uploads', filename)
      await fs.writeFile(filePath, req.file.buffer)

      let updatedUser
      try {
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: `/api/uploads/${filename}` },
        })
      } catch (error) {
        await fs.unlink(filePath).catch(() => { })
        throw error
      }

      if (user.avatarUrl) {
        const oldFileName = user.avatarUrl.replace('/api/uploads/', '').replace('/uploads/', '')
        const oldFilePath = path.join(process.cwd(), 'uploads', oldFileName)
        await fs.unlink(oldFilePath).catch(() => { })
      }

      const responseUser: UserDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        avatarUrl: updatedUser.avatarUrl,
        telegramId: updatedUser.telegramId,
        isDemo: updatedUser.isDemo
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
      telegramId: updatedUser.telegramId,
      isDemo: updatedUser.isDemo
    }

    return res.json({ user: responseUser })
  } catch (error) {
    console.error('Ошибка при удалении аватара:', error)
    return res.status(500).json({ error: 'Ошибка сервера при удалении аватара' })
  }
})
