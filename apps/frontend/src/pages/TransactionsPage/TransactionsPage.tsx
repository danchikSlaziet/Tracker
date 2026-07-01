import styles from './TransactionsPage.module.css'
import { TransactionWidget } from '@/widgets/TransactionsWidget/TransactionsWidget'

export const TransactionsPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Мои транзакции</h1>
      </header>
      <TransactionWidget />
    </div>
  )
}