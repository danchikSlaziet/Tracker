import { Router } from 'express'
import Groq from 'groq-sdk'
import { prisma } from '../index'
import { z } from 'zod'

export const assistantRouter = Router()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
  baseURL: process.env.GROQ_API_BASE_URL || undefined,
})
const MODEL = 'qwen/qwen3.8-27b'

// Хелперы для безопасного парсинга входных данных от LLM
function parseSafeDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function parseSafeLimit(limit?: number | string): number {
  const num = Number(limit)
  if (isNaN(num) || num <= 0) return 10
  return Math.min(Math.floor(num), 50) // ограничиваем максимум 50 записями
}

// Описание тулзов
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_summary',
      description: 'Возвращает общий баланс, суммарные доходы и расходы за период',
      parameters: {
        type: 'object',
        properties: {
          dateFrom: { type: 'string', description: 'Начало периода YYYY-MM-DD' },
          dateTo: { type: 'string', description: 'Конец периода YYYY-MM-DD' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_spending_by_category',
      description: 'Возвращает разбивку расходов или доходов по категориям за период',
      parameters: {
        type: 'object',
        properties: {
          dateFrom: { type: 'string', description: 'Начало периода YYYY-MM-DD' },
          dateTo: { type: 'string', description: 'Конец периода YYYY-MM-DD' },
          type: {
            type: 'string',
            enum: ['income', 'expense', 'incomes', 'expenses'],
            description: 'Тип транзакций: expense (расходы) или income (доходы)',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_monthly_trend',
      description: 'Возвращает доходы и расходы по месяцам для анализа тренда',
      parameters: {
        type: 'object',
        properties: {
          months: { type: 'number', description: 'Количество последних месяцев (по умолчанию 3)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_transactions',
      description: 'Возвращает последние транзакции пользователя',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Количество транзакций (по умолчанию 10)' },
          type: {
            type: 'string',
            enum: ['income', 'expense', 'incomes', 'expenses'],
            description: 'Фильтр по типу: expense или income',
          },
          categoryId: { type: 'string', description: 'Фильтр по категории (ID или название)' },
        },
        required: [],
      },
    },
  },
]

// Исполнители тулзов
async function execGetSummary(userId: string, args: { dateFrom?: string; dateTo?: string }) {
  const where: any = { userId }
  const from = parseSafeDate(args.dateFrom)
  const to = parseSafeDate(args.dateTo)

  if (from || to) {
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    }
  }

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'income' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const totalIncome = (income._sum.amount ?? 0) / 100
  const totalExpense = (expense._sum.amount ?? 0) / 100

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: income._count + expense._count,
  }
}

async function execGetSpendingByCategory(
  userId: string,
  args: { dateFrom?: string; dateTo?: string; type?: string }
) {
  const normalizedType = args.type?.toLowerCase().startsWith('inc') ? 'income' : 'expense'
  const where: any = { userId, type: normalizedType }

  const from = parseSafeDate(args.dateFrom)
  const to = parseSafeDate(args.dateTo)

  if (from || to) {
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    }
  }

  const result = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  })

  const categoryIds = result.map((r) => r.categoryId)
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true },
  })

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return result.map((r) => ({
    category: categoryMap.get(r.categoryId)?.name ?? 'Без категории',
    icon: categoryMap.get(r.categoryId)?.icon ?? '📁',
    total: (r._sum.amount ?? 0) / 100,
    count: r._count,
  }))
}

async function execGetMonthlyTrend(userId: string, args: { months?: number | string }) {
  const monthsCount = Math.min(Math.max(Number(args.months) || 3, 1), 24)
  const since = new Date()
  since.setMonth(since.getMonth() - monthsCount)

  const transactions = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { gte: since } },
    _sum: { amount: true },
    _count: true,
  })

  return transactions.map((t) => ({
    type: t.type,
    total: (t._sum.amount ?? 0) / 100,
    count: t._count,
  }))
}

async function execGetRecentTransactions(
  userId: string,
  args: { limit?: number | string; type?: string; categoryId?: string }
) {
  const where: any = { userId }

  if (args.type) {
    where.type = args.type.toLowerCase().startsWith('inc') ? 'income' : 'expense'
  }

  if (args.categoryId) {
    where.category = {
      OR: [
        { id: args.categoryId },
        { name: { contains: args.categoryId, mode: 'insensitive' } },
      ],
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: parseSafeLimit(args.limit),
    include: { category: true },
  })

  return transactions.map((t) => ({
    date: t.date.toISOString().split('T')[0],
    description: t.description,
    amount: t.amount / 100,
    type: t.type,
    category: t.category.name,
  }))
}

// self-Correction loop при сбоях в базе
async function executeTool(userId: string, name: string, args: any) {
  try {
    switch (name) {
      case 'get_summary':
        return await execGetSummary(userId, args)
      case 'get_spending_by_category':
        return await execGetSpendingByCategory(userId, args)
      case 'get_monthly_trend':
        return await execGetMonthlyTrend(userId, args)
      case 'get_recent_transactions':
        return await execGetRecentTransactions(userId, args)
      default:
        return { error: `Неизвестная функция: ${name}` }
    }
  } catch (error: any) {
    console.error(`Ошибка выполнения тулза ${name}:`, error)
    return {
      error: `Не удалось получить данные: ${error.message || 'Ошибка базы данных'}. Попробуй переформулировать запрос или запросить данные без фильтра.`,
    }
  }
}

// временные метки в системном промпте
function getSystemPrompt() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentYear = now.getFullYear()
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0')
  const currentMonthStart = `${currentYear}-${currentMonthNum}-01`

  return `Ты — умный и дружелюбный финансовый ассистент приложения Finance Tracker.
Твоя задача — помогать пользователю анализировать его личные доходы, расходы и финансовые привычки.

Контекст времени:
- Сегодняшняя дата: ${today}.
- Текущий месяц: ${currentYear}-${currentMonthNum} (начало месяца: ${currentMonthStart}).
- Все суммы в ответах форматируй понятно (например: 12 500 ₽).

Правила работы:
1. Для ответов на вопросы о деньгах пользователя (баланс, расходы, доходы, статистика, транзакции) ОБЯЗАТЕЛЬНО используй доступные функции. Не пиши теги <tool_call> в тексте ответа — вызывай функции только через стандартный механизм инструментов.
2. Отвечай кратко, емко и по делу, выделяй главное жирным шрифтом и форматируй списками, если категорий несколько.
3. Если пользователь задает общие финансовые вопросы (например, про накопления, инвестиции или финансовую грамотность) — дай полезный и лаконичный совет.
4. Если вопрос вообще не относится к финансам (например, про погоду, политику, знаменитостей) — вежливо напомни, что ты специализированный финансовый ассистент, и предложи узнать что-то о его финансах.`
}

const TOOL_LABELS: Record<string, string> = {
  get_summary: 'Считаю баланс и итоги...',
  get_spending_by_category: 'Анализирую расходы по категориям...',
  get_monthly_trend: 'Сравниваю динамику по месяцам...',
  get_recent_transactions: 'Ищу нужные операции...',
}

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const chatBodySchema = z.object({
  message: z.string().min(1, 'Сообщение не может быть пустым'),
  history: z.array(chatMessageSchema).optional().default([]),
})

assistantRouter.post('/chat', async (req, res): Promise<any> => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' })
  }

  const parsed = chatBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const { message, history } = parsed.data

  // стриминг заголовки
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendEvent = (data: { type: 'chunk' | 'tool_calling' | 'done' | 'error'; text?: string; tool?: string }) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    // небольшой контекст
    const recentHistory = history.slice(-8)

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...recentHistory.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    let maxSteps = 5

    while (maxSteps > 0) {
      maxSteps--

      const response = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: 'auto',
      })

      const choice = response.choices[0]

      // вызов тулза
      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        messages.push(choice.message)

        for (const toolCall of choice.message.tool_calls) {
          const toolLabel = TOOL_LABELS[toolCall.function.name] || 'Запрашиваю данные из базы...'
          sendEvent({ type: 'tool_calling', tool: toolLabel })

          let toolArgs = {}
          try {
            toolArgs = JSON.parse(toolCall.function.arguments || '{}')
          } catch {
            toolArgs = {}
          }

          const toolResult = await executeTool(userId, toolCall.function.name, toolArgs)

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          })
        }
      } else {
        // убираем любые случайные теги и разметку
        let text = choice.message.content || ''
        text = text
          .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
          .replace(/<function=[\s\S]*?<\/function>/gi, '')
          .replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/gi, '')
          .trim()

        if (text) {
          sendEvent({ type: 'chunk', text })
        }
        break
      }
    }

    sendEvent({ type: 'done' })
    res.end()
  } catch (error: any) {
    console.error('Ошибка в работе AI-ассистента:', error)
    sendEvent({ type: 'error', text: error.message || 'Ошибка генерации ответа' })
    res.end()
  }
})