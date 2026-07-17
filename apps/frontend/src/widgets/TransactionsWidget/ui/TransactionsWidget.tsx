import styles from './TransactionsWidget.module.css'
import { useState } from "react"
import {
  CreateTransactionForm,
  TransactionFiltersPanel,
  TransactionList,
  ImportTransactionsForm,
  type TransactionFilters
} from "@/features/transactions"

import { useDebounce } from "@/shared/lib/useDebounce"

export const TransactionWidget = () => {
  const [filters, setFilters] = useState<TransactionFilters>({})

  const debouncedSearch = useDebounce(filters?.search, 400)

  const finalFilters = {
    ...filters,
    search: debouncedSearch
  }
  return (
    <>
      <TransactionFiltersPanel filters={filters} onChange={setFilters} />
      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <CreateTransactionForm />
          <ImportTransactionsForm />
        </div>
        <div className={styles.listWrapper}>
          <TransactionList filters={finalFilters} />
        </div>
      </div>
    </>

  )
}