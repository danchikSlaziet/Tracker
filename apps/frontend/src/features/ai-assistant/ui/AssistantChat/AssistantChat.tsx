import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react'
import { useAssistantStore } from '../../model/assistantStore'
import styles from './AssistantChat.module.css'
import { Button } from '@finance/ui-kit'
import Markdown from 'react-markdown'



const SUGGESTIONS = [
  'Сколько я потратил в этом месяце?',
  'На что уходит больше всего денег?',
  'Какой у меня текущий баланс?',
  'Покажи последние расходы',
]

export function AssistantChat() {
  const [inputText, setInputText] = useState('')
  const { messages, isLoading, currentToolStatus, sendMessage } = useAssistantStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // автоскролл вниз при появлении новых сообщений/букв
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentToolStatus])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return
    sendMessage(inputText)
    setInputText('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return
    sendMessage(suggestion)
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesList}>
        {messages.map((msg) => {
          if (!msg.content && msg.role === 'assistant' && !currentToolStatus) {
            return null
          }

          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${styles[msg.role]}`}
            >
              {msg.role === 'assistant' && (
                <div className={`${styles.avatar} ${styles.botAvatar}`}>
                  <Bot size={18} />
                </div>
              )}
              <div className={styles.bubble}>
                {msg.role === 'assistant' ? (
                  <div className={styles.markdownContent}>
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          )
        })}

        {/* плашка вызова тулзов */}
        {currentToolStatus && (
          <div className={`${styles.messageRow} ${styles.assistant}`}>
            <div className={`${styles.avatar} ${styles.botAvatar}`}>
              <Sparkles size={16} />
            </div>
            <div className={styles.toolBadge}>
              <Loader2 size={14} className={styles.spin} />
              <span>{currentToolStatus}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* дефолт вопросы */}
      <div className={styles.suggestions}>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className={styles.suggestionChip}
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Спроси о финансах..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isLoading || !inputText.trim()}
          title="Отправить"
        >
          {isLoading ? <Loader2 size={18} /> : <Send size={18} />}
        </Button>
      </form>
    </div>
  )
}