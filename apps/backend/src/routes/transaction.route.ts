import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PaginatedResponse } from '@finance/shared-types'

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

const getTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
})


transactionsRouter.get('/', async (req, res) => {
  const userId = req.userId
  const parsed = getTransactionsSchema.safeParse(req.query)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { page, limit, type, categoryId, dateFrom, dateTo, search } = parsed.data

  const where: any = {
    userId,
  }

  if (type) {
    where.type = type as 'income' | 'expense'
  }

  if (categoryId) {
    where.categoryId = categoryId as string
  }

  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom ? { gte: new Date(dateFrom as string) } : {}),
      ...(dateTo ? { lte: new Date(dateTo as string) } : {}),
    }
  }

  if (search) {
    where.description = {
      contains: search as string,
      mode: 'insensitive' // lowercase == uppercase
    }
  }

  const isPaginated = page !== undefined && limit !== undefined
  const skip = isPaginated ? (page - 1) * limit : undefined
  const take = isPaginated ? limit : undefined

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ],
      include: { category: true },
      skip,
      take,
    }),
    prisma.transaction.count({ where })
  ])
  const response: PaginatedResponse<any> = {
    data: transactions,
    meta: {
      totalCount,
      totalPages: isPaginated ? Math.ceil(totalCount / limit) : 1,
      currentPage: isPaginated ? page : 1,
      limit: isPaginated ? limit : totalCount,
    }
  }
  res.json(response)
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

  const io = req.app.get('io')

  const emitProgress = (percent: number, stage: string, metadata?: any) => {
    if (io) {
      io.to(`user:${req.userId}`).emit('import:progress', { percent, stage, ...metadata })
    }
  }

  let progressInterval: NodeJS.Timeout | undefined

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

    emitProgress(10, 'reading_file')

    // 1. Получаем все существующие категории пользователя
    const categories = await prisma.category.findMany({
      where: { userId, isDeleted: false }
    })

    const categoriesListStr = categories
      .map(c => `- ID: ${c.id}, Название: "${c.name}", Тип: "${c.type}"`)
      .join('\n')

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    }, {
      baseUrl: process.env.GEMINI_API_BASE_URL || undefined
    })

    const prompt = `
        Ты — точный ИИ-парсер банковских выписок. Твоя задача — извлечь список всех транзакций из прикрепленного PDF-документа банковской выписки.
        Документ может быть от любого банка (Т-Банк, Сбербанк, Альфа-Банк, ВТБ и т.д.).

        Извлеки следующие поля для каждой транзакции:
        - date: Дата операции в формате YYYY-MM-DD
        - amount: Сумма в рублях (всегда положительное число с плавающей точкой)
        - type: Тип транзакции: "income" (если деньги пришли/пополнение/зарплата/перевод вам) или "expense" (если деньги ушли/покупка/перевод кому-то/снятие)
        - description: Понятное описание (название магазина, категория услуги или имя отправителя перевода)
        - categoryId: Выбери наиболее подходящий ID категории из предоставленного ниже списка. Если ни одна существующая категория не подходит для этой транзакции, укажи null.
        - newCategory: Если categoryId равен null (категория не найдена в списке), создай для транзакции объект новой категории. Если categoryId заполнен, укажи null. 
          Объект newCategory должен содержать следующие поля:
          * name: Короткое и понятное название новой категории на русском языке (например, "Аптеки", "Спорт", "Аренда", "Коммунальные платежи", "Стриминг"). Максимум 2 слова.
          * icon: Один наиболее подходящий emoji-символ (например, "💊" для аптек, "🍿" для кино).
          * color: Подходящий HEX-цвет для этой категории (например, "#ef4444").

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


    emitProgress(30, 'sending_to_gemini')

    let currentPercent = 30
    progressInterval = setInterval(() => {
      if (currentPercent < 75) {
        currentPercent += 5
        emitProgress(currentPercent, 'analyzing')
      }
    }, 5000)

    // 4. Отправляем запрос в ИИ
    const result = await model.generateContent([prompt, pdfPart])
    if (progressInterval) clearInterval(progressInterval)

    const responseText = result.response.text()
    emitProgress(80, 'parsing_data')

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

    // 5.1 Обрабатываем новые категории, которые предложил ИИ

    const categoryCache = new Map<string, string>()
    for (const cat of categories) {
      categoryCache.set(cat.name.toLowerCase().trim(), cat.id)
    }
    categoryCache.set('неразобранное', unsortedCategory.id)

    // через Map отсеиваем дубликаты внутри иишных категорий
    const newCategoriesToCreate = new Map<string, { name: string, icon: string, color: string, type: 'income' | 'expense' }>()

    for (const t of parsedData) {
      if (!t.categoryId && t.newCategory && t.newCategory.name) {
        const catName = t.newCategory.name.trim()
        const catNameLower = catName.toLowerCase()

        // если такой категории еще нет в базе пользователя и мы ее еще не запланировали создать:
        if (!categoryCache.has(catNameLower) && !newCategoriesToCreate.has(catNameLower)) {
          newCategoriesToCreate.set(catNameLower, {
            name: catName,
            icon: t.newCategory.icon || '📁',
            color: t.newCategory.color || '#94a3b8',
            type: t.type === 'income' ? 'income' : 'expense'
          })
        }
      }
    }

    // создаем новые иишные категории
    if (newCategoriesToCreate.size > 0) {
      // createMany в Prisma/Postgres не умеет возвращать сгенерированные ID записей (??? чзнх)
      const createdCategories = await Promise.all(
        Array.from(newCategoriesToCreate.values()).map(async (catData) => {
          const newCat = await prisma.category.create({
            data: {
              name: catData.name,
              icon: catData.icon,
              color: catData.color,
              type: catData.type,
              userId
            }
          })
          return newCat
        })
      )

      // добавляем созданные категории в наш кэш, чтобы привязать их к транзакциям
      for (const cat of createdCategories) {
        categoryCache.set(cat.name.toLowerCase().trim(), cat.id)
      }
    }

    // 6. готовим транзакции для сохранения
    const transactionsData = parsedData.map(t => {
      let finalCategoryId = unsortedCategory!.id

      if (t.categoryId && categories.some(c => c.id === t.categoryId)) {
        // если ИИ выбрал существующую категорию
        finalCategoryId = t.categoryId
      } else if (t.newCategory && t.newCategory.name) {
        // если ИИ предложил новую категорию — ищем её ID в нашем кэше созданных категорий
        const catNameLower = t.newCategory.name.trim().toLowerCase()
        const cachedId = categoryCache.get(catNameLower)
        if (cachedId) {
          finalCategoryId = cachedId
        }
      }

      return {
        type: t.type === 'income' ? 'income' : 'expense',
        amount: Math.round((Number(t.amount) || 0) * 100), // в копейках
        description: t.description || 'Импортированная транзакция',
        date: t.date ? new Date(t.date) : new Date(),
        categoryId: finalCategoryId,
        userId
      }
    })

    emitProgress(90, 'saving_database')
    // Массовое добавление в БД
    const created = await prisma.transaction.createMany({
      data: transactionsData
    })
    emitProgress(100, 'completed', { importedCount: created.count })

    res.json({
      message: 'Импорт завершен успешно',
      importedCount: created.count,
    })
  } catch (error: any) {
    console.error('Import error:', error)

    if (progressInterval) clearInterval(progressInterval)
    emitProgress(0, 'failed', { error: error.message || 'Ошибка импорта' })


    const errorMessage = error.message || ''

    if (
      errorMessage.includes('User location is not supported') ||
      errorMessage.includes('location is not supported') ||
      errorMessage.includes('fetch failed')
    ) {
      res.status(403).json({
        error: 'Не удалось подключиться к Google Gemini API.'
      })
      return
    }

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