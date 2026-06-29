import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token

  if (!token) {
    res.status(401).json({ error: 'Не авторизован' })
    return
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string }
    
    // Кладём userId в объект запроса, чтобы следующие обработчики могли его использовать
    req.userId = payload.userId
    
    // Передаём дальше
    next()
  } catch (error) {
    res.status(401).json({ error: 'Неверный или просроченный токен' })
    return
  }
}