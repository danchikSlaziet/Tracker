import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.description}>
          Запрошенный адрес не существует или был удален.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            Назад
          </button>
          <Link to={ROUTES.HOME} className={styles.homeBtn}>
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
