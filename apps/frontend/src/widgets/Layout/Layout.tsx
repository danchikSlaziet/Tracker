import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'
import { useLogout } from '@/features/auth/api/useLogout'
import { ROUTES } from '@/shared/config/routes'
import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle'

export function Layout() {
  const { mutate: logout, isPending } = useLogout()

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <ThemeToggle />
        <div className={styles.logo}>💰 Finance</div>
        <nav className={styles.nav}>
          <NavLink
            to={ROUTES.HOME}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
          >
            📊 Дашборд
          </NavLink>
          <NavLink
            to={ROUTES.TRANSACTIONS}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
          >
            💸 Транзакции
          </NavLink>
          <NavLink
            to={ROUTES.CATEGORIES}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
          >
            🏷️ Категории
          </NavLink>
        </nav>
        <button
          onClick={() => logout()}
          disabled={isPending}
          className={styles.logoutBtn}
        >
          {isPending ? 'Выход...' : 'Выйти'}
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet /> {/* перерисовка только этой части, а не всего Layout в отл. от children */}
      </main>
    </div>
  )
}