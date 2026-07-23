import styles from './TransactionsWidget.module.css'
import { useState } from "react"
import {
  CreateTransactionModal,
  ImportTransactionsModal,
  TransactionFiltersPanel,
  TransactionList,
  type TransactionFilters
} from "@/features/transactions"
import { Button } from "@finance/ui-kit"
import { Filter, FileUp, Plus } from "lucide-react"
import { useDebounce } from "@/shared/lib/useDebounce"

export const TransactionWidget = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)

  const [filters, setFilters] = useState<TransactionFilters>({})
  const debouncedSearch = useDebounce(filters?.search, 400)

  const finalFilters = {
    ...filters,
    search: debouncedSearch
  }

  return (
    <div className={styles.container}>
      {/* 1. Верхняя панель управления */}
      <div className={styles.actionHeader}>
        <button
          className={`${styles.filterToggleBtn} ${isFiltersVisible ? styles.activeFilterBtn : ''}`}
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
        >
          <Filter size={16} />
          <span>Фильтры</span>
        </button>

        <div className={styles.rightActions}>
          <button
            className={styles.importBtn}
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileUp size={16} />
            <span>Импорт PDF</span>
          </button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.createBtn}
            data-test-id="open-create-transaction-modal-btn"
            data-testid="open-create-transaction-modal-btn"
          >
            <Plus size={16} />
            <span>Транзакция</span>
          </Button>
        </div>
      </div>

      {/* 2. Раскрываемая панель фильтров */}
      {isFiltersVisible && (
        <div className={styles.filtersWrapper}>
          <TransactionFiltersPanel filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* 3. Список транзакций */}
      <div className={styles.listWrapper}>
        <TransactionList filters={finalFilters} />
      </div>

      {/* 4. Модальные окна */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ImportTransactionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}