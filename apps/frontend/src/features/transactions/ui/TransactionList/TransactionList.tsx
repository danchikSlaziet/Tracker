import { useDeleteTransaction, useInfiniteTransactions } from '../../api/useTransactions'
import { formatMoney } from '@/shared/lib/formatMoney'
import styles from './TransactionList.module.css'
import type { TransactionFilters } from '../../model/transactionsSchema'
import { TransactionCategoryEditor } from '../TransactionCategoryEditor/TransactionCategoryEditor'
import { useIntersectionObserver } from '@/shared/lib/useIntersectionObserver'

interface TransactionListProps {
  filters?: TransactionFilters
}

export const TransactionList = ({ filters }: TransactionListProps) => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteTransactions(filters, 20)
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()

  // структура Tanstack => flatmap, иначе map внутри map придется делать

  //   data.pages = [
  //   // Страница 1
  //   {
  //     data: [ { id: 1, desc: 'Кофе' }, { id: 2, desc: 'Такси' } ],
  //     meta: { currentPage: 1, totalPages: 3 }
  //   },
  //   // Страница 2 (подгрузилась при скролле)
  //   {
  //     data: [ { id: 3, desc: 'Метро' }, { id: 4, desc: 'Обед' } ],
  //     meta: { currentPage: 2, totalPages: 3 }
  //   }
  // ]

  const transactions = data?.pages.flatMap((page) => page.data) ?? []

  const triggerRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  if (isLoading) return <div>Загрузка транзакций...</div>
  if (error) return <div>Ошибка при загрузке транзакций.</div>


  if (transactions.length === 0) {
    return <div className={styles.emptyState}>У вас пока нет транзакций. Добавьте первую!</div>
  }

  return (
    <div className={styles.container}>
      {transactions.map((tx) => (
        <div data-test-id="transaction-item" key={tx.id} className={styles.transactionCard}>
          <div className={styles.leftInfo}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: `${tx.category.color}20` }}
            >
              {tx.category.icon}
            </div>

            <div className={styles.details}>
              <TransactionCategoryEditor
                transactionId={tx.id}
                currentCategory={tx.category}
                transactionType={tx.type}
              />
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
              data-test-id="delete-transaction-btn"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}

      <div ref={triggerRef} className={styles.trigger}>
        {isFetchingNextPage && <div className={styles.loader}>Подгрузка транзакций...</div>}
      </div>
    </div>
  )
}