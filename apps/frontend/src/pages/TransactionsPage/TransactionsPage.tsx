import { CreateTransactionForm } from '@/features/transactions/ui/CreateTransactionForm'
import { TransactionList } from '@/features/transactions/ui/TransactionList/TransactionList'
import styles from './TransactionsPage.module.css'
import { useState } from 'react'
import type { TransactionFilters } from '@/features/transactions/model/transactionsSchema'
import { TransactionFiltersPanel } from '@/features/transactions/ui/TransactionFilters/TransactionFilters'
import { useDebounce } from '@/shared/lib/useDebounce'

export const TransactionsPage = () => {
  const [filters, setFilters] = useState<TransactionFilters>({})

  const debouncedSearch = useDebounce(filters?.search, 400)

  const finalFilters = {
    ...filters,
    search: debouncedSearch
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Мои транзакции</h1>
      </header>

      <TransactionFiltersPanel filters={filters} onChange={setFilters} />

      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <CreateTransactionForm />
        </div>
        <div className={styles.listWrapper}>
          <TransactionList filters={finalFilters} />
        </div>
      </div>
    </div>
  )
}