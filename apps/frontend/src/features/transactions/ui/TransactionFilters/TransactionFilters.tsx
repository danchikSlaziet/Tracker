import { useCategories } from '@/entities/category'
import styles from './TransactionFilters.module.css'
import type { TransactionFilters } from '../../model/transactionsSchema'
import { Search, RotateCcw } from 'lucide-react'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

export const TransactionFiltersPanel = ({ filters, onChange }: TransactionFiltersProps) => {
  const { data: categories } = useCategories()

  const handleChange = (field: keyof TransactionFilters, value: string) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const hasActiveFilters = Boolean(
    filters.search || filters.type || filters.categoryId || filters.dateFrom || filters.dateTo
  )

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            data-test-id="search-input"
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по описанию..."
            value={filters.search ?? ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.controlsRow}>
        <select
          data-test-id="select-type-filter"
          className={styles.select}
          value={filters.type ?? ''}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option data-test-id="select-option-all-types" value="">Все типы</option>
          <option data-test-id="select-option-income-type" value="income">Доходы</option>
          <option data-test-id="select-option-expense-type" value="expense">Расходы</option>
        </select>

        <select
          className={styles.select}
          value={filters.categoryId ?? ''}
          onChange={(e) => handleChange('categoryId', e.target.value)}
        >
          <option value="">Все категории</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <div className={styles.dateGroup}>
          <div className={styles.dateField}>
            <span className={styles.dateLabel}>С:</span>
            <input
              className={styles.dateInput}
              type="date"
              title="Дата с"
              value={filters.dateFrom ?? ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
            />
          </div>

          <div className={styles.dateField}>
            <span className={styles.dateLabel}>По:</span>
            <input
              className={styles.dateInput}
              type="date"
              title="Дата по"
              value={filters.dateTo ?? ''}
              onChange={(e) => handleChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            className={styles.resetBtn}
            onClick={() => onChange({})}
            title="Сбросить все фильтры"
          >
            <RotateCcw size={14} />
            <span>Сбросить</span>
          </button>
        )}
      </div>
    </div>
  )
}