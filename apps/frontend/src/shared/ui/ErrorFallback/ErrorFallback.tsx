import styles from './ErrorFallback.module.css'

export function ErrorFallback() {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>Что-то пошло не так</h2>
        <p className={styles.description}>
          Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
        </p>
        <button onClick={handleReload} className={styles.button}>
          Обновить страницу
        </button>
      </div>
    </div>
  )
}