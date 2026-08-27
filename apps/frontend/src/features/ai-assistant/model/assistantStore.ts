import { create } from 'zustand'
import type { ChatMessage } from '@finance/shared-types'
import { sendAssistantMessage } from '../api/assistantApi'

interface AssistantState {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  currentToolStatus: string | null
  setIsOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  sendMessage: (userText: string) => Promise<void>
  clearChat: () => void
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'Привет! Я твой финансовый ассистент. \n\nМогу посчитать твои расходы, подсказать баланс, найти траты по категориям или дать совет по бюджету. С чего начнем?',
  createdAt: new Date().toISOString(),
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  isOpen: false,
  messages: [INITIAL_MESSAGE],
  isLoading: false,
  currentToolStatus: null,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (userText: string) => {
    const trimmed = userText.trim()
    const { messages, isLoading } = get()

    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    const assistantTempId = `assistant-${Date.now()}`
    const assistantPlaceholder: ChatMessage = {
      id: assistantTempId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }

    // сообщение юзера + заготовка под ответ нейросети
    set({
      messages: [...messages, userMessage, assistantPlaceholder],
      isLoading: true,
      currentToolStatus: null,
    })

    // история для контекста (да, всего 6 сообщ.)
    const historyForApi = get()
      .messages.filter((m) => m.id !== 'welcome-msg' && m.id !== assistantTempId)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      await sendAssistantMessage(
        {
          message: trimmed,
          history: historyForApi,
        },
        {
          onChunk: (chunkText) => {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantTempId
                  ? { ...msg, content: msg.content + chunkText }
                  : msg
              ),
            }))
          },
          onToolCalling: (toolLabel) => {
            set({ currentToolStatus: toolLabel })
          },
          onDone: () => {
            set({ isLoading: false, currentToolStatus: null })
          },
          onError: (err) => {
            const errStr = String(err || '')
            const friendlyMessage = errStr.includes('429') || errStr.includes('Rate limit')
              ? 'Слишком много запросов. Подождите 10–15 секунд и повторите.'
              : 'Что-то пошло не так. Попробуйте повторить запрос чуть позже.'

            set((state) => ({
              isLoading: false,
              currentToolStatus: null,
              messages: state.messages.map((msg) =>
                msg.id === assistantTempId
                  ? { ...msg, content: msg.content || `⚠️ ${friendlyMessage}` }
                  : msg
              ),
            }))
          },
        }
      )
    } catch (err: any) {
      const errStr = String(err?.message || '')
      const friendlyMessage = errStr.includes('429') || errStr.includes('Rate limit')
        ? 'Слишком много запросов. Подождите 10–15 секунд и повторите.'
        : 'Что-то пошло не так. Попробуйте повторить запрос чуть позже.'

      set((state) => ({
        isLoading: false,
        currentToolStatus: null,
        messages: state.messages.map((msg) =>
          msg.id === assistantTempId
            ? { ...msg, content: msg.content || `⚠️ ${friendlyMessage}` }
            : msg
        ),
      }))
    }
  },

  clearChat: () => {
    set({
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Чат очищен. Чем я могу помочь по твоим финансам?',
          createdAt: new Date().toISOString(),
        },
      ],
      currentToolStatus: null,
    })
  },
}))