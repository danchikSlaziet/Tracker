import { useState } from "react"
import { useTransactions, ExpensesPieChart, TransactionListSkeleton } from "@/features/transactions"
import styles from './DashboardWidget.module.css'
import { formatMoney } from "@/shared/lib/formatMoney"
import { formatDate } from "@/shared/lib/formatDate"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Skeleton } from "@/shared/ui/Skeleton"
import { CategoryIcon } from "@/entities/category"

export const DashboardWidget = () => {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)
  const { data: transactions = [], isLoading } = useTransactions()

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense

  // последние 5 транзакций для превью
  const recentTransactions = transactions.slice(0, 5)

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id)
  }

  return (
    <div className={styles.container}>
      {/* 1. Карточки показателей */}
      <div className={styles.statsGrid}>
        <div className={`${styles.card} ${styles.cardBalance}`}>
          <span className={styles.cardLabel}>Баланс</span>
          <span className={styles.cardValue}>
            {isLoading ? <Skeleton width={100} height={24} borderRadius={6} /> : formatMoney(balance)}
          </span>
        </div>

        <div className={`${styles.card} ${styles.cardIncome}`}>
          <span className={styles.cardLabel}>Доходы</span>
          <span className={`${styles.cardValue} ${styles.incomeValue}`}>
            {isLoading ? <Skeleton width={100} height={24} borderRadius={6} /> : formatMoney(income)}
          </span>
        </div>

        <div className={`${styles.card} ${styles.cardExpense}`}>
          <span className={styles.cardLabel}>Расходы</span>
          <span className={`${styles.cardValue} ${styles.expenseValue}`}>
            {isLoading ? <Skeleton width={100} height={24} borderRadius={6} /> : formatMoney(expense)}
          </span>
        </div>
      </div>

      {/* 2. График расходов по категориям */}
      <div className={styles.chartSection}>
        <ExpensesPieChart transactions={transactions} />
      </div>

      {/* 3. Последние транзакции */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние транзакции</h2>
          <Link to="/transactions" className={styles.viewAllLink}>
            <span>Все транзакции</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading && <TransactionListSkeleton count={3} />}
        {!isLoading && recentTransactions.length === 0 && (
          <div className={styles.empty}>У вас пока нет транзакций</div>
        )}

        {!isLoading && recentTransactions.length > 0 && (
          <div className={styles.list}>
            {recentTransactions.map(transaction => {
              const isExpanded = expandedTxId === transaction.id

              return (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.leftInfo}>
                    <div className={styles.iconBox}>
                      <CategoryIcon name={transaction.category.icon} size={18} color={transaction.category.color} />
                    </div>

                    <div className={styles.details}>
                      <span
                        className={`${styles.description} ${isExpanded ? styles.expandedDescription : ''}`}
                        onClick={() => toggleExpand(transaction.id)}
                        title={transaction.description}
                      >
                        {transaction.description}
                      </span>
                      <div className={styles.metaRow}>
                        <span className={styles.categoryName}>{transaction.category.name}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.date}>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`${styles.amount} ${styles[transaction.type]}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
