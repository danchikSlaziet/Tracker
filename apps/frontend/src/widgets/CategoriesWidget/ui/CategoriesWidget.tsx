import { useState } from 'react'
import { useCreateCategory, useUpdateCategory } from '@/entities/category'
import type { Category } from '@/entities/category'
import { CategoryForm, CategoryList, type CategoryFormValues } from '@/features/caregories'
import styles from './CategoriesWidget.module.css'

export const CategoriesWidget = () => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()

  const handleSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data },
        { onSuccess: () => setEditingCategory(null) }
      )
    } else {
      createCategory(data)
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.formWrapper}>
        <CategoryForm
          initialData={editingCategory ?? undefined}
          onSubmit={handleSubmit}
          onCancel={editingCategory ? () => setEditingCategory(null) : undefined}
          isLoading={isCreating || isUpdating}
        />
      </div>

      <div className={styles.listWrapper}>
        <CategoryList onEdit={setEditingCategory} />
      </div>
    </div>
  )
}