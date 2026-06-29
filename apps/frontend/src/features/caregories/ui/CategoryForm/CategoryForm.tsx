import { useCategoryForm } from './useCategoryForm'
import type { CategoryFormValues } from '../../model/categorySchema'
import styles from './CategoryForm.module.css'

interface CategoryFormProps {
  initialData?: CategoryFormValues
  onSubmit: (data: CategoryFormValues) => void
  onCancel?: () => void
  isLoading?: boolean
}

export const CategoryForm = ({ initialData, onSubmit, onCancel, isLoading }: CategoryFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useCategoryForm(initialData)

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>
        {initialData ? 'Редактировать категорию' : 'Новая категория'}
      </h2>

      <div className={styles.group}>
        <label htmlFor='icon'>Иконка (эмодзи)</label>
        <input id='icon' className={styles.input} {...register('icon')}  />
        {errors.icon && <span className={styles.error}>{errors.icon.message}</span>}
      </div>

      <div className={styles.group}>
        <label htmlFor='name'>Название</label>
        <input id='name' className={styles.input} {...register('name')} placeholder="Например: Кафе" />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.group}>
        <label htmlFor='color'>Цвет</label>
        <div className={styles.colorRow}>
          <input id='color' className={styles.colorPicker} type="color" {...register('color')} />
          <span className={styles.colorHex}>выберите цвет</span>
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor='type'>Тип</label>
        <select id='type' className={styles.select} {...register('type')}>
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
          <option value="both">Оба</option>
        </select>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {initialData ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  )
}