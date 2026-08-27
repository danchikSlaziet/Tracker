import { Bot, X, Trash2 } from 'lucide-react'
import { useAssistantStore } from '../../model/assistantStore'
import { AssistantChat } from '../AssistantChat/AssistantChat'
import styles from './AssistantModal.module.css'

export function AssistantModal() {
  const { isOpen, setIsOpen, clearChat } = useAssistantStore()

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.window} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconBox}>
              <Bot size={18} />
            </div>
            <div>
              <h3 className={styles.title}>AI Ассистент</h3>
              <p className={styles.subtitle}>Понимает контекст ваших финансов</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={clearChat}
              title="Очистить чат"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setIsOpen(false)}
              title="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <AssistantChat />
      </div>
    </div>
  )
}
