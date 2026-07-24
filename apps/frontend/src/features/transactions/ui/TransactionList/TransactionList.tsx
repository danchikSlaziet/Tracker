import { useState } from 'react'
import { useDeleteTransaction, useInfiniteTransactions } from '../../api/useTransactions'
import { formatMoney } from '@/shared/lib/formatMoney'
import { formatDate } from '@/shared/lib/formatDate'
import styles from './TransactionList.module.css'
import type { TransactionFilters } from '../../model/transactionsSchema'
import { TransactionCategoryEditor } from '../TransactionCategoryEditor/TransactionCategoryEditor'
import { useIntersectionObserver } from '@/shared/lib/useIntersectionObserver'
import { Trash2 } from 'lucide-react'
import { TransactionListSkeleton } from './TransactionListSkeleton'

interface TransactionListProps {
  filters?: TransactionFilters
}

export const TransactionList = ({ filters }: TransactionListProps) => {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteTransactions(filters, 20)
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()

  const transactions = data?.pages.flatMap((page) => page.data) ?? []

  const triggerRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id)
  }

  if (isLoading) return <TransactionListSkeleton />
  if (error) return <div className={styles.errorState}>Ошибка при загрузке транзакций.</div>

  if (transactions.length === 0) {
    return <div className={styles.emptyState}>У вас пока нет транзакций. Добавьте первую!</div>
  }

  return (
    <div className={styles.container}>
      {transactions.map((tx) => {
        const isExpanded = expandedTxId === tx.id

        return (
          <div data-test-id="transaction-item" data-testid="transaction-item" key={tx.id} className={styles.transactionCard}>
            <div className={styles.iconBox} style={{ backgroundColor: `${tx.category.color}20` }}>
              {tx.category.icon}
            </div>

            <div className={styles.contentBody}>
              <div className={styles.topRow}>
                <span
                  className={`${styles.description} ${isExpanded ? styles.expandedDescription : ''}`}
                  onClick={() => toggleExpand(tx.id)}
                  title={tx.description}
                >
                  {tx.description}
                </span>

                <div className={styles.amountBox}>
                  <span className={`${styles.amount} ${styles[tx.type]}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                  </span>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteTransaction(tx.id)}
                    disabled={isDeleting}
                    title="Удалить транзакцию"
                    aria-label="Удалить транзакцию"
                    data-test-id="delete-transaction-btn"
                    data-testid="delete-transaction-btn"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className={styles.bottomRow}>
                <TransactionCategoryEditor
                  transactionId={tx.id}
                  currentCategory={tx.category}
                  transactionType={tx.type}
                />
                <span className={styles.date}>{formatDate(tx.date)}</span>
              </div>
            </div>
          </div>
        )
      })}

      <div ref={triggerRef} className={styles.trigger}>
        {isFetchingNextPage && <div className={styles.loader}>Подгрузка транзакций...</div>}
      </div>
    </div>
  )
}