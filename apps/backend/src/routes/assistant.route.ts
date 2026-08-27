import { Router } from 'express'
import Groq from 'groq-sdk'
import { prisma } from '../index'
import { z } from 'zod'

export const assistantRouter = Router()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_API_BASE_URL || undefined,
})
const MODEL = 'qwen/qwen3.8-27b'

// тулзы для AI
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
          type: { type: 'string', enum: ['income', 'expense'], description: 'Тип транзакций' },
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
          type: { type: 'string', enum: ['income', 'expense'] },
          categoryId: { type: 'string', description: 'Фильтр по категории (UUID)' },
        },
        required: [],
      },
    },
  },
]


// исполнители тулзов 
async function execGetSummary(userId: string, args: { dateFrom?: string; dateTo?: string }) {
  const where: any = { userId }
  if (args.dateFrom || args.dateTo) {
    where.date = {
      ...(args.dateFrom ? { gte: new Date(args.dateFrom) } : {}),
      ...(args.dateTo ? { lte: new Date(args.dateTo) } : {}),
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
  args: { dateFrom?: string; dateTo?: string; type: 'income' | 'expense' }
) {
  const where: any = { userId, type: args.type }

  if (args.dateFrom || args.dateTo) {
    where.date = {
      ...(args.dateFrom ? { gte: new Date(args.dateFrom) } : {}),
      ...(args.dateTo ? { lte: new Date(args.dateTo) } : {}),
    }
  }

  const result = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  })

  // подтягиваем имена категорий
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

async function execGetMonthlyTrend(userId: string, args: { months?: number }) {
  const monthsCount = args.months ?? 3
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
  args: { limit?: number; type?: string; categoryId?: string }
) {
  const where: any = { userId }
  if (args.type) where.type = args.type
  if (args.categoryId) where.categoryId = args.categoryId

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: args.limit ?? 10,
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


// диспетчер вызова тулзов
async function executeTool(userId: string, name: string, args: any) {
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
      throw new Error(`Неизвестный инструмент: ${name}`)
  }
}

// системный промпт
function getSystemPrompt() {
  const today = new Date().toISOString().split('T')[0]
  return `Ты — умный и дружелюбный финансовый ассистент приложения Finance Tracker.
Твоя задача — помогать пользователю анализировать его личные доходы, расходы и финансовые привычки.

Контекст:
- Сегодняшняя дата: ${today}.
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
    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const firstResponse = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
    })

    const choice = firstResponse.choices[0]

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

      // стримим финальный ответ на основе данных из БД
      const stream = await groq.chat.completions.create({
        model: MODEL,
        messages,
        stream: true,
      })

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) {
          sendEvent({ type: 'chunk', text })
        }
      }
    } else {
      // прямой ответ без вызова инструментов
      const text = choice.message.content || ''
      sendEvent({ type: 'chunk', text })
    }

    sendEvent({ type: 'done' })
    res.end()
  } catch (error: any) {
    console.error('Ошибка в работе AI-ассистента:', error)
    sendEvent({ type: 'error', text: error.message || 'Ошибка генерации ответа' })
    res.end()
  }
})