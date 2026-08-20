import styles from './CategoriesPage.module.css'
import { CategoriesWidget } from '@/widgets/CategoriesWidget'
import { PageMeta } from '@/shared/ui/PageMeta'

export const CategoriesPage = () => {
  return (
    <div className={styles.page}>
      <PageMeta title="Категории" description="Управление категориями расходов и доходов" />
      <header className={styles.header}>
        <h1>Управление категориями</h1>
      </header>
      <CategoriesWidget />
    </div>
  )
}