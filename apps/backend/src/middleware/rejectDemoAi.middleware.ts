import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'

export const rejectDemoAi = async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { isDemo: true },
  })

  if (!user) {
    res.status(401).json({ error: 'Не авторизован' })
    return
  }

  if (user?.isDemo) {
    res.status(403).json({
      error: 'В демо-режиме ассистент и импорт PDF недоступны. Зарегистрируйтесь, чтобы ими пользоваться.',
    })
    return
  }

  next()
}