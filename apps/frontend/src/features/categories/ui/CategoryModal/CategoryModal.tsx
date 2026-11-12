import styles from './CategoryModal.module.css'
import { CategoryForm } from '../CategoryForm/CategoryForm'
import type { CategoryFormValues } from '../../model/categorySchema'
import type { Category } from '@/entities/category'
import { X } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  editingCategory?: Category | null
  onSubmit: (data: CategoryFormValues) => void
  isLoading?: boolean
}

export function CategoryModal({
  isOpen,
  onClose,
  editingCategory,
  onSubmit,
  isLoading
}: CategoryModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} >
      <div data-testid="category-modal" className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>
        <h2 className={styles.title}>
          {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
        </h2>
        <CategoryForm
          initialData={editingCategory ?? undefined}
          onSubmit={(data) => {
            onSubmit(data)
            onClose()
          }}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
