import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'

export const requireVerified = async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { isVerified: true },
  })

  if (!user?.isVerified) {
    res.status(403).json({ error: 'Подтвердите email, чтобы продолжить' })
    return
  }

  next()
}