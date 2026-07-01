import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const transactionsRouter = Router()

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // ограничение 10 МБ
})
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')


const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Сумма должна быть больше нуля'),
  description: z.string().min(1, 'Описание не может быть пустым'),
  categoryId: z.string().uuid('Некорректный ID категории'),
  date: z.string().datetime(), // ISO-строкa
})

const updateTransactionSchema = z.object({
  categoryId: z.string().uuid('Некорректный ID категории')
}).partial()



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
    orderBy: [
      { date: 'desc' },
      { id: 'desc' } // Гарантирует стабильный порядок, если даты одинаковые
    ],
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

transactionsRouter.patch('/:id', async (req, res) => {
  const userId = req.userId
  const transactionId = req.params.id

  const parsed = updateTransactionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const data = parsed.data

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })

  if (!transaction || transaction.userId !== userId) {
    res.status(403).json({ error: 'Транзакция не найдена или нет прав на редактирование' })
    return
  }

  // Если передана категория, проверим, принадлежит ли она юзеру
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })
    if (!category || category.userId !== userId) {
      res.status(403).json({ error: 'Категория не найдена или недоступна' })
      return
    }
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {})
    },
    include: { category: true }
  })

  res.status(200).json(updatedTransaction)
})

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ error: 'Пользователь не авторизован' })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'Файл не загружен' })
      return
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'Gemini API key отсутствует :(' })
      return
    }

    // 1. Получаем все существующие категории пользователя
    const categories = await prisma.category.findMany({
      where: { userId, isDeleted: false }
    })

    const categoriesListStr = categories
      .map(c => `- ID: ${c.id}, Название: "${c.name}", Тип: "${c.type}"`)
      .join('\n')

    // 2. Инициализируем Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })

    const prompt = `
        Ты — точный ИИ-парсер банковских выписок. Твоя задача — извлечь список всех транзакций из прикрепленного PDF-документа банковской выписки.
        Документ может быть от любого банка (Т-Банк, Сбербанк, Альфа-Банк, ВТБ и т.д.).

        Извлеки следующие поля для каждой транзакции:
        - date: Дата операции в формате YYYY-MM-DD
        - amount: Сумма в рублях (всегда положительное число с плавающей точкой)
        - type: Тип транзакции: "income" (если деньги пришли/пополнение/зарплата/перевод вам) или "expense" (если деньги ушли/покупка/перевод кому-то/снятие)
        - description: Понятное описание (название магазина, категория услуги или имя отправителя перевода)
        - categoryId: Выбери наиболее подходящий ID категории из предоставленного ниже списка. Если ни одна категория не подходит, укажи null.

        ПРАВИЛО ДЛЯ ВНУТРЕННИХ ПЕРЕВОДОВ:
        Если транзакция является внутренним переводом между собственными счетами, переводом на инвесткопилку, сейф-пакет или между своими картами/счетами в любых банках:
        1. В качестве description укажи "Перевод между своими счетами".
        2. В качестве categoryId выбери категорию, содержащую в названии слова "Перевод", "Свои счета", "Сбережения" или "Накопления". Если такой категории нет, верни null.

        СПИСОК ДОСТУПНЫХ КАТЕГОРИЙ:
        ${categoriesListStr}

        Верни строго валидный JSON-массив объектов с указанными полями. Не пиши никакого сопроводительного текста, только JSON.
      `

    // 3. Переводим буфер файла в base64 для API
    const pdfPart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    }

    // 4. Отправляем запрос в ИИ
    const result = await model.generateContent([prompt, pdfPart])
    const responseText = result.response.text()

    let parsedData
    try {
      parsedData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Gemini output:', responseText)
      res.status(500).json({ error: 'Не удалось распарсить ответ нейросети' })
      return
    }

    if (!Array.isArray(parsedData)) {
      res.status(500).json({ error: 'Нейросеть вернула некорректный формат данных' })
      return
    }

    // 5. Ищем или создаем категорию "Неразобранное"
    let unsortedCategory = categories.find(c => c.name === 'Неразобранное')
    if (!unsortedCategory) {
      unsortedCategory = await prisma.category.create({
        data: {
          name: 'Неразобранное',
          icon: '📁',
          color: '#94a3b8',
          type: 'expense',
          userId
        }
      })
    }

    // 6. Подготавливаем транзакции для сохранения (с переводом суммы в копейки)
    const transactionsData = parsedData.map(t => {
      const hasValidCategory = categories.some(c => c.id === t.categoryId)
      const finalCategoryId = hasValidCategory ? t.categoryId : unsortedCategory!.id

      return {
        type: t.type === 'income' ? 'income' : 'expense',
        amount: Math.round((Number(t.amount) || 0) * 100), // сохраняем в копейках
        description: t.description || 'Импортированная транзакция',
        date: t.date ? new Date(t.date) : new Date(),
        categoryId: finalCategoryId,
        userId
      }
    })

    // Массовое добавление в БД
    const created = await prisma.transaction.createMany({
      data: transactionsData
    })

    res.json({
      message: 'Импорт завершен успешно',
      importedCount: created.count,
    })
  } catch (error: any) {
    console.error('Import error:', error)

    const errorMessage = error.message || ''

    // Проверяем, исчерпан ли лимит запросов (код 429 или статус RESOURCE_EXHAUSTED)
    if (
      error.status === 429 ||
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')
    ) {
      res.status(429).json({
        error: 'Превышен лимит запросов к нейросети. Пожалуйста, подождите минуту и попробуйте снова.'
      })
      return
    }
    res.status(500).json({ error: errorMessage || 'Ошибка сервера при импорте' })
  }
})