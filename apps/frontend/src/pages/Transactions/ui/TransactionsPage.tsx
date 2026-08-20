import styles from './TransactionsPage.module.css'
import { TransactionWidget } from '@/widgets/TransactionsWidget'
import { PageMeta } from '@/shared/ui/PageMeta'

export const TransactionsPage = () => {
  return (
    <div className={styles.page}>
      <PageMeta title="Транзакции" description="История доходов и расходов с фильтрацией и поиском" />
      <header className={styles.header}>
        <h1>Мои транзакции</h1>
      </header>
      <TransactionWidget />
    </div>
  )
}