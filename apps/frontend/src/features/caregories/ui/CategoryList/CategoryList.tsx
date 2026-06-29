import { useCategories, useDeleteCategory, useRestoreCategory } from '@/entities/category/api/useCategories'
import type { Category } from '@finance/shared-types'
import styles from './CategoryList.module.css'
import { useState } from 'react'

interface CategoryListProps {
  onEdit: (category: Category) => void
}

export const CategoryList = ({ onEdit }: CategoryListProps) => {
  const [showDeleted, setShowDeleted] = useState(false)

  const { data: categories, isLoading } = useCategories({
    onlyDeleted: showDeleted
  })
  const { mutate: deleteCategory } = useDeleteCategory()
  const { mutate: restoreCategory } = useRestoreCategory()

  if (isLoading) return <div>Загрузка категорий...</div>

  return (
    <div className={styles.list}>
      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.target.checked)}
        />
        Показать удалённые категории
      </label>
      {
        !categories.length ? (
          <div className={styles.emptyState}>
            {showDeleted ? 'Удалённых категорий нет' : 'У вас пока нет категорий'}
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className={styles.card}>
              <div className={styles.left}>
                <div className={styles.icon} style={{ backgroundColor: `${cat.color}20` }}>
                  {cat.icon}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{cat.name}</span>
                  <span className={styles.type}>
                    {cat.type === 'income' ? 'Доход' : cat.type === 'expense' ? 'Расход' : 'Оба'}
                  </span>
                </div>
              </div>

              {!showDeleted && <div className={styles.actions}>
                <div className={styles.colorDot} style={{ backgroundColor: cat.color }} />
                <button className={styles.actionBtn} onClick={() => onEdit(cat)}>✏️</button>
                <button className={styles.actionBtn} onClick={() => deleteCategory(cat.id)}>🗑️</button>
              </div>}
              {
                showDeleted && <div className={styles.actions}>
                  <button className={styles.restoreBtn} onClick={() => (restoreCategory(cat.id))}>Восстановить</button>
                </div>
              }
            </div>
          ))
        )
      }
    </div>
  )
}