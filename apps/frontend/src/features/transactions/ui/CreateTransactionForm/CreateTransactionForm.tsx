import { useCreateTransactionForm } from './useCreateTransactionForm'
import styles from './CreateTransactionForm.module.css'

interface CreateTransactionFormProps {
  onSuccess?: () => void
  showTitle?: boolean
}

export const CreateTransactionForm = ({ onSuccess, showTitle = false }: CreateTransactionFormProps) => {
  const {
    form: { register, watch, setValue, formState: { errors } },
    onSubmit,
    isPending,
    serverError,
    filteredCategories,
    isCategoriesLoading,
  } = useCreateTransactionForm(onSuccess)

  const currentType = watch('type')

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {showTitle && <h3 className={styles.title}>Добавить транзакцию</h3>}

      {/* Переключатель типа транзакции (Segmented Control) */}
      <div className={styles.typeSegmentedControl}>
        <button
          type="button"
          className={`${styles.typeSegmentBtn} ${currentType === 'expense' ? styles.activeExpense : ''}`}
          onClick={() => setValue('type', 'expense')}
          data-test-id="type-expense-radio"
          data-testid="type-expense-radio"
        >
          Расход
        </button>
        <button
          type="button"
          className={`${styles.typeSegmentBtn} ${currentType === 'income' ? styles.activeIncome : ''}`}
          onClick={() => setValue('type', 'income')}
          data-test-id="type-income-radio"
          data-testid="type-income-radio"
        >
          Доход
        </button>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='amount'>Сумма</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          id='amount'
          placeholder="Например: 1500"
          data-test-id="amount-input"
          data-testid="amount-input"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='categoryId'>Категория</label>
        <select id='categoryId' className={styles.select} disabled={isCategoriesLoading} data-test-id="category-select" data-testid="category-select" {...register('categoryId')}>
          <option value="" disabled>Выберите категорию</option>
          {filteredCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className={styles.error}>{errors.categoryId.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание</label>
        <input id="description" className={styles.input} type="text" placeholder="Например: Пятерочка" data-test-id="description-input" data-testid="description-input" {...register('description')} />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Дата</label>
        <input id="date" className={styles.input} type="date" data-test-id="date-input" data-testid="date-input" {...register('date')} />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
      </div>

      {serverError && (
        <div className={styles.error}>
          {(serverError as any)?.response?.data?.error || 'Произошла ошибка сервера'}
        </div>
      )}

      <button className={styles.submitBtn} type="submit" disabled={isPending} data-test-id="transaction-submit-btn" data-testid="transaction-submit-btn">
        {isPending ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  )
}