import { useState } from 'react'
import { useCreateCategory, useUpdateCategory } from '@/entities/category'
import type { Category } from '@/entities/category'
import { CategoryForm, CategoryList, CategoryModal, type CategoryFormValues } from '@/features/caregories'
import styles from './CategoriesWidget.module.css'
import { Button } from '@finance/ui-kit'
import { Plus } from 'lucide-react'

export const CategoriesWidget = () => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()

  const handleSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data },
        {
          onSuccess: () => {
            setEditingCategory(null)
            setIsModalOpen(false)
          }
        }
      )
    } else {
      createCategory(data, {
        onSuccess: () => setIsModalOpen(false)
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    if (window.innerWidth < 768) {
      setIsModalOpen(true)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    if (window.innerWidth < 768) {
      setIsModalOpen(true)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Button data-test-id="open-create-category-btn"  onClick={handleOpenCreate} className={styles.createBtn}>
          <Plus size={16} />
          <span>Новая категория</span>
        </Button>
      </div>

      <div className={styles.content}>
        {/* На десктопе оставляем липкую форму для быстрого ввода с заголовком */}
        <div className={styles.desktopFormWrapper}>
          <CategoryForm
            initialData={editingCategory ?? undefined}
            onSubmit={handleSubmit}
            onCancel={editingCategory ? () => setEditingCategory(null) : undefined}
            isLoading={isCreating || isUpdating}
            showTitle={true}
          />
        </div>

        {/* Список категорий */}
        <div className={styles.listWrapper}>
          <CategoryList onEdit={handleEdit} />
        </div>
      </div>

      {/* Попап модалка (только для мобилок) */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        editingCategory={editingCategory}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}