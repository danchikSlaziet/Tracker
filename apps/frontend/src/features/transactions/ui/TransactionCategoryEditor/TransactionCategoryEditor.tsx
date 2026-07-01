import { useState, useRef, useEffect } from 'react'
import { useCategories, useCreateCategory } from '@/entities/category/api/useCategories'
import { useUpdateTransactions } from '../../api/useTransactions'
import styles from './TransactionCategoryEditor.module.css'
import type { Category } from '@finance/shared-types';

interface TransactionCategoryEditorProps {
  transactionId: string;
  currentCategory: Category;
  transactionType: string;
}

export const TransactionCategoryEditor = ({
  transactionId,
  currentCategory,
  transactionType
}: TransactionCategoryEditorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: categories } = useCategories()
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransactions()
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory()

  // Фильтруем категории по типу транзакции (доходы к доходам, расходы к расходам)
  const filteredCategories = categories?.filter((c: Category) => c.type === transactionType) || []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Обработчик выбора существующей категории
  const handleSelectCategory = (categoryId: string) => {
    if (categoryId !== currentCategory.id) {
      updateTransaction({ id: transactionId, data: { categoryId } })
    }
    setIsOpen(false)
  }

  // Обработчик создания новой категории на лету
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        icon: '📁',
        color: '#94a3b8',
        type: transactionType as 'income' | 'expense'
      })
      updateTransaction({ id: transactionId, data: { categoryId: newCategory.id } })

      setIsOpen(false)
      setNewCategoryName('')
    } catch (error) {
      console.error('Ошибка при создании категории', error)
    }
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        className={styles.categoryBadge}
        style={{ backgroundColor: `${currentCategory.color}20`, color: currentCategory.color }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentCategory.icon}</span>
        <span>{currentCategory.name}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.list}>
            {filteredCategories.map((cat: Category) => (
              <button
                key={cat.id}
                className={styles.categoryItem}
                onClick={() => handleSelectCategory(cat.id)}
                disabled={isUpdating}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.createSection}>
            <input
              type="text"
              className={styles.createInput}
              placeholder="Новая категория..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <button
              className={styles.createBtn}
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isCreating || isUpdating}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}