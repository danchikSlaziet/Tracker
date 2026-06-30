import { useCreateTransactionForm } from './useCreateTransactionForm'
import styles from './CreateTransactionForm.module.css'

interface CreateTransactionFormProps {
  onSuccess?: () => void
}

export const CreateTransactionForm = ({ onSuccess }: CreateTransactionFormProps) => {
  const {
    form: { register, formState: { errors } },
    onSubmit,
    isPending,
    serverError,
    filteredCategories,
    isCategoriesLoading,
  } = useCreateTransactionForm(onSuccess)

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3>Добавить транзакцию</h3>

      <div className={styles.radioGroup}>
        <label className={styles.radioLabel}>
          <input type="radio" value="expense" data-test-id="type-expense-radio" {...register('type')} /> Расход
        </label>
        <label className={styles.radioLabel}>
          <input type="radio" value="income" data-test-id="type-income-radio" {...register('type')} /> Доход
        </label>
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
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='categoryId'>Категория</label>
        <select id='categoryId' className={styles.select} disabled={isCategoriesLoading} data-test-id="category-select" {...register('categoryId')}>
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
        <input id="description" className={styles.input} type="text" placeholder="Например: Пятерочка" data-test-id="description-input" {...register('description')} />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Дата</label>
        <input id="date" className={styles.input} type="date" data-test-id="date-input" {...register('date')} />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
      </div>

      {serverError && (
        <div className={styles.error}>
          {(serverError as any)?.response?.data?.error || 'Произошла ошибка сервера'}
        </div>
      )}

      <button className={styles.submitBtn} type="submit" disabled={isPending} data-test-id="transaction-submit-btn">
        {isPending ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  )
}