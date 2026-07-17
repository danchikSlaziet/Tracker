
import { useCategories } from '@/entities/category'
import styles from './TransactionFilters.module.css'
import type { TransactionFilters } from '../../model/transactionsSchema'
import { Input } from '@finance/ui-kit'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

export const TransactionFiltersPanel = ({ filters, onChange }: TransactionFiltersProps) => {
  const { data: categories } = useCategories()

  const handleChange = (field: keyof TransactionFilters, value: string) => {
    onChange({
      ...filters,
      // Если пользак сбросил поле — убираем 
      [field]: value || undefined,
    })
  }

  return (
    <div className={styles.filters}>
      <Input data-test-id='search-input' placeholder='Поиск по описанию' onChange={(e) => handleChange('search', e.target.value)}/>
      <select
        data-test-id='select-type-filter'
        className={styles.select}
        value={filters.type ?? ''}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option data-test-id='select-option-all-types' value="">Все типы</option>
        <option data-test-id='select-option-income-type' value="income">Доходы</option>
        <option data-test-id='select-option-expense-type' value="expense">Расходы</option>
      </select>

      <select
        className={styles.select}
        value={filters.categoryId ?? ''}
        onChange={(e) => handleChange('categoryId', e.target.value)}
      >
        <option value="">Все категории</option>
        {categories?.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      <input
        className={styles.input}
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={(e) => handleChange('dateFrom', e.target.value)}
      />

      <input
        className={styles.input}
        type="date"
        value={filters.dateTo ?? ''}
        onChange={(e) => handleChange('dateTo', e.target.value)}
      />

      {/* Кнопка сброса */}
      <button
        className={styles.resetBtn}
        onClick={() => onChange({})}
      >
        Сбросить
      </button>
    </div>
  )
}