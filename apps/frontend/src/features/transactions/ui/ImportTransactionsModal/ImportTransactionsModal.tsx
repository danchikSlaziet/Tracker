import styles from './ImportTransactionsModal.module.css'
import { ImportTransactionsForm } from '../ImportTransactionsForm/ImportTransactionsForm'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ImportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>
        <h2 className={styles.title}>Импорт выписки (PDF)</h2>
        <ImportTransactionsForm onSuccess={onClose} />
      </div>
    </div>
  )
}
