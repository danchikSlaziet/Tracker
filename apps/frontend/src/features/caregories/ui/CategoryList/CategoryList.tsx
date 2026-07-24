import { useCategories, useDeleteCategory, useRestoreCategory } from '@/entities/category'
import type { Category } from '@/entities/category'
import styles from './CategoryList.module.css'
import { useState } from 'react'
import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { CategoryListSkeleton } from './CategoryListSkeleton'

interface CategoryListProps {
  onEdit: (category: Category) => void
}

export const CategoryList = ({ onEdit }: CategoryListProps) => {
  const [showDeleted, setShowDeleted] = useState(false)
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)

  const { data: categories, isLoading } = useCategories({
    onlyDeleted: showDeleted
  })
  const { mutate: deleteCategory } = useDeleteCategory()
  const { mutate: restoreCategory } = useRestoreCategory()

  const toggleExpand = (id: string) => {
    setExpandedCatId(expandedCatId === id ? null : id)
  }

  if (isLoading) return <CategoryListSkeleton />


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

      {!categories?.length ? (
        <div className={styles.emptyState}>
          {showDeleted ? 'Удалённых категорий нет' : 'У вас пока нет категорий'}
        </div>
      ) : (
        categories?.map((cat) => {
          const isExpanded = expandedCatId === cat.id

          return (
            <div key={cat.id} className={styles.card}>
              <div className={styles.left}>
                <div className={styles.icon} style={{ backgroundColor: `${cat.color}20` }}>
                  {cat.icon}
                </div>
                <div className={styles.info}>
                  <span
                    className={`${styles.name} ${isExpanded ? styles.expandedName : ''}`}
                    onClick={() => toggleExpand(cat.id)}
                    title={cat.name}
                  >
                    {cat.name}
                  </span>
                  <span className={styles.type}>
                    {cat.type === 'income' ? 'Доход' : cat.type === 'expense' ? 'Расход' : 'Оба'}
                  </span>
                </div>
              </div>

              {!showDeleted && (
                <div className={styles.actions}>
                  <div className={styles.colorDot} style={{ backgroundColor: cat.color }} title={`Цвет: ${cat.color}`} />
                  <button
                    className={styles.actionBtn}
                    onClick={() => onEdit(cat)}
                    title="Редактировать категорию"
                    aria-label="Редактировать категорию"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteCategory(cat.id)}
                    title="Удалить категорию"
                    aria-label="Удалить категорию"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}

              {showDeleted && (
                <div className={styles.actions}>
                  <button
                    className={styles.restoreBtn}
                    onClick={() => restoreCategory(cat.id)}
                    title="Восстановить категорию"
                  >
                    <RotateCcw size={14} />
                    <span>Восстановить</span>
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}