import { useCategoryForm } from './useCategoryForm'
import type { CategoryFormValues } from '../../model/categorySchema'
import styles from './CategoryForm.module.css'
import { Palette } from 'lucide-react'
import { CATEGORY_ICONS } from '@finance/shared-types'
import { CategoryIcon } from '@/entities/category'

interface CategoryFormProps {
  initialData?: CategoryFormValues
  onSubmit: (data: CategoryFormValues) => void
  onCancel?: () => void
  isLoading?: boolean
  showTitle?: boolean
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
]

export const CategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  showTitle = false
}: CategoryFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useCategoryForm(initialData)

  const currentType = watch('type')
  const currentColor = watch('color')
  const currentIcon = watch('icon')

  const isCustomColor = Boolean(currentColor && !PRESET_COLORS.includes(currentColor))

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {showTitle && (
        <h3 className={styles.title}>
          {initialData ? 'Редактировать категорию' : 'Новая категория'}
        </h3>
      )}

      {/* Segmented Control типа категории */}
      <div className={styles.group}>
        <label>Тип категории</label>
        <div className={styles.typeSegmentedControl}>
          <button
            type="button"
            className={`${styles.typeSegmentBtn} ${currentType === 'expense' ? styles.activeSegment : ''}`}
            onClick={() => setValue('type', 'expense')}
          >
            Расход
          </button>
          <button
            type="button"
            className={`${styles.typeSegmentBtn} ${currentType === 'income' ? styles.activeSegment : ''}`}
            onClick={() => setValue('type', 'income')}
          >
            Доход
          </button>
          <button
            type="button"
            className={`${styles.typeSegmentBtn} ${currentType === 'both' ? styles.activeSegment : ''}`}
            onClick={() => setValue('type', 'both')}
          >
            Оба
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="name">Название</label>
        <input id="name" data-test-id="category-name-input" className={styles.input} {...register('name')} placeholder="Например: Кафе" />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.group}>
        <span className={styles.fieldLabel}>Иконка</span>
        <div className={styles.iconGrid}>
          {CATEGORY_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`${styles.iconButton} ${currentIcon === icon ? styles.selectedIcon : ''}`}
              onClick={() => setValue('icon', icon)}
              aria-label={icon}
              aria-pressed={currentIcon === icon}
            >
              <CategoryIcon name={icon} color={currentIcon === icon ? currentColor : undefined} />
            </button>
          ))}
        </div>
        {errors.icon && <span className={styles.error}>{errors.icon.message}</span>}
      </div>

      <div className={styles.group}>
        <label>Цвет категории</label>
        <div className={styles.colorPalette}>
          {PRESET_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`${styles.colorSwatch} ${currentColor === hex ? styles.selectedSwatch : ''}`}
              style={{ backgroundColor: hex }}
              onClick={() => setValue('color', hex)}
              title={`Цвет ${hex}`}
            />
          ))}

          {/* Специальная кнопка с иконкой палитры для выбора любого своего цвета */}
          <label
            className={`${styles.customColorBtn} ${isCustomColor ? styles.selectedCustomColor : ''}`}
            style={isCustomColor ? { backgroundColor: currentColor } : undefined}
            title="Выбрать свой цвет"
          >
            <Palette size={14} className={styles.paletteIcon} />
            <input
              type="color"
              className={styles.colorPickerHidden}
              value={currentColor || '#3b82f6'}
              onChange={(e) => setValue('color', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
        )}
        <button type="submit" data-test-id="category-submit-btn" className={styles.submitBtn} disabled={isLoading}>
          {initialData ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  )
}