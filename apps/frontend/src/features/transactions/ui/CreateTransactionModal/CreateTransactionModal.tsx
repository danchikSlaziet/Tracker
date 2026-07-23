import styles from './CreateTransactionModal.module.css'
import { CreateTransactionForm } from '../CreateTransactionForm/CreateTransactionForm'
import { X } from 'lucide-react'

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTransactionModal({ isOpen, onClose }: CreateTransactionModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>
        <h2 className={styles.title}>Новая транзакция</h2>
        <CreateTransactionForm onSuccess={onClose} />
      </div>
    </div>
  )
}