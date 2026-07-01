import { useTransactions } from "@/features/transactions/api/useTransactions"
import { ExpensesPieChart } from "@/features/transactions/ui/ExpensesPieChart/ExpensesPieChart"
import styles from './DashboardWidget.module.css'
import { formatMoney } from "@/shared/lib"

export const DashboardWidget = () => {
  const { data: transactions = [], isLoading } = useTransactions()

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense

  // последние 5 транзакций для превью
  const recentTransactions = transactions.slice(0, 5)
  return (
    <>
      <ExpensesPieChart transactions={transactions} />

      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.cardBalance}`}>
          <span className={styles.cardLabel}>Баланс</span>
          <span className={styles.cardValue}>
            {isLoading ? '...' : formatMoney(balance)}
          </span>
        </div>
        <div className={`${styles.card} ${styles.cardIncome}`}>
          <span className={styles.cardLabel}>Доходы</span>
          <span className={styles.cardValue}>
            {isLoading ? '...' : formatMoney(income)}
          </span>
        </div>
        <div className={`${styles.card} ${styles.cardExpense}`}>
          <span className={styles.cardLabel}>Расходы</span>
          <span className={styles.cardValue}>
            {isLoading ? '...' : formatMoney(expense)}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Последние транзакции</h2>
        <div className={styles.list}>
          {isLoading && <div>Загрузка...</div>}
          {!isLoading && recentTransactions.length === 0 && (
            <div className={styles.empty}>Транзакций пока нет</div>
          )}
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className={styles.transaction}>
              <div className={styles.transactionLeft}>
                <div
                  className={styles.transactionIcon}
                  style={{ backgroundColor: `${transaction.category.color}20` }}
                >
                  {transaction.category.icon}
                </div>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionDesc}>{transaction.description}</span>
                  <span className={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
              <span className={`${styles.transactionAmount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}