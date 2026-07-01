import styles from './CategoriesPage.module.css'
import { CategoriesWidget } from '@/widgets/CategoriesWidget/CategoriesWidget'

export const CategoriesPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Управление категориями</h1>
      </header>
      <CategoriesWidget />
    </div>
  )
}