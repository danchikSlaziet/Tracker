import styles from './DashboardPage.module.css'
import { DashboardWidget } from '@/widgets/DashboardWidget'
import { PageMeta } from '@/shared/ui/PageMeta'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageMeta title="Дашборд" description="Аналитика расходов, статистика и баланс" />
      <h1 className={styles.title}>Дашборд</h1>
      <DashboardWidget />
    </div>
  )
}