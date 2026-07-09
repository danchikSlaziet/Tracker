import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div role="status" aria-label="Загрузка" className={styles.wrapper}>
      <div className={styles.spinner} />
    </div>
  )
}