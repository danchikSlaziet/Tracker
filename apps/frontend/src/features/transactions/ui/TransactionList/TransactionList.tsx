import { useTransactions, useDeleteTransaction } from '../../api/useTransactions'
import { formatMoney } from '@/shared/lib/formatMoney'
import styles from './TransactionList.module.css'
import type { TransactionFilters } from '../../model/transactionsSchema'

interface TransactionListProps {
  filters?: TransactionFilters
}

export const TransactionList = ({ filters }: TransactionListProps) => {
  const { data: transactions, isLoading, error } = useTransactions(filters)
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()

  if (isLoading) return <div>Загрузка транзакций...</div>
  if (error) return <div>Ошибка при загрузке транзакций.</div>
  if (!transactions || transactions.length === 0) {
    return <div className={styles.emptyState}>У вас пока нет транзакций. Добавьте первую!</div>
  }

  return (
    <div className={styles.container}>
      {transactions.map((tx) => (
        <div data-testid="transaction-item" key={tx.id} className={styles.transactionCard}>
          <div className={styles.leftInfo}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: `${tx.category.color}20` }}
            >
              {tx.category.icon}
            </div>

            <div className={styles.details}>
              <span className={styles.categoryName}>{tx.category.name}</span>
              <span className={styles.description}>{tx.description}</span>
              <span className={styles.date}>
                {new Date(tx.date).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          <div className={styles.rightInfo}>
            <span className={`${styles.amount} ${styles[tx.type]}`}>
              {tx.type === 'income' ? '+' : '-'} {formatMoney(tx.amount)}
            </span>

            <button
              className={styles.deleteBtn}
              onClick={() => deleteTransaction(tx.id)}
              disabled={isDeleting}
              data-testid="delete-transaction-btn"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}