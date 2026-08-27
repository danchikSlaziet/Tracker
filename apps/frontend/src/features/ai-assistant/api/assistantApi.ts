import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { AssistantChatDto, AssistantStreamEvent } from '@finance/shared-types'

interface StreamCallbacks {
  onChunk: (text: string) => void
  onToolCalling: (toolLabel: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function sendAssistantMessage(
  dto: AssistantChatDto,
  callbacks: StreamCallbacks
) {
  const url = `${import.meta.env.VITE_API_URL}/assistant/chat`

  await fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // httpOnly cookie
    body: JSON.stringify(dto),

    onmessage(msg) {
      try {
        const event: AssistantStreamEvent = JSON.parse(msg.data)

        if (event.type === 'chunk') {
          callbacks.onChunk(event.text)
        } else if (event.type === 'tool_calling') {
          callbacks.onToolCalling(event.tool)
        } else if (event.type === 'done') {
          callbacks.onDone()
        } else if (event.type === 'error') {
          callbacks.onError(event.text)
        }
      } catch {
        // игнорируем пустые или сервисные строки
      }
    },

    onerror(err) {
      callbacks.onError(err.message || 'Ошибка соединения с ассистентом')
      throw err // предотвращает бесконечные авто-повторы библиотеки при ошибке
    },
  })
}