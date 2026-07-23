import styles from './ImportTransactionsModal.module.css'
import { ImportTransactionsForm } from '../ImportTransactionsForm/ImportTransactionsForm'
import { X } from 'lucide-react'

interface ImportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>
        <h2 className={styles.title}>Импорт выписки (PDF)</h2>
        <ImportTransactionsForm onSuccess={onClose} />
      </div>
    </div>
  )
}
