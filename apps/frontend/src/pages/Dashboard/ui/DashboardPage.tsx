import styles from './DashboardPage.module.css'
import { DashboardWidget } from '@/widgets/DashboardWidget'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Дашборд</h1>
      <DashboardWidget />
    </div>
  )
}