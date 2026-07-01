import { CreateTransactionForm } from "@/features/transactions/ui/CreateTransactionForm/CreateTransactionForm"
import { TransactionFiltersPanel } from "@/features/transactions/ui/TransactionFilters/TransactionFilters"
import { TransactionList } from "@/features/transactions/ui/TransactionList/TransactionList"

import styles from './TransactionsWidget.module.css'
import { useState } from "react"
import type { TransactionFilters } from "@/features/transactions/model/transactionsSchema"
import { useDebounce } from "@/shared/lib/useDebounce"
import { ImportTransactionsForm } from "@/features/transactions/ui/ImportTransactionsForm/ImportTransactionsForm"

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