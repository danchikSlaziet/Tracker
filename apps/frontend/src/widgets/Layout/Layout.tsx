import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import { useLogout } from '@/features/auth/api/useLogout'
import { ROUTES } from '@/shared/config/routes'
import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle'
import { Suspense, useState } from 'react'
import { PageLoader } from '@/shared/ui'
import { useMe } from '@/features/auth/api/useMe'
import { Avatar } from '@/shared/ui/Avatar/Avatar'
import { ProfileModal } from '@/features/profile/ui/ProfileModal'

export function Layout() {
  const { mutate: logout, isPending } = useLogout()
  const { data: authData } = useMe()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()

  const user = authData?.user

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
        {user && (
          <div className={styles.profileBlock} onClick={() => setIsProfileOpen(true)}>
            <Avatar src={user.avatarUrl} email={user.email} size="sm" />
            <span className={styles.profileEmail} title={user.email}>
              {user.email}
            </span>
          </div>
        )}
        <button
          onClick={() => logout()}
          disabled={isPending}
          className={styles.logoutBtn}
        >
          {isPending ? 'Выход...' : 'Выйти'}
        </button>
      </aside>
      <main className={styles.main}>
        <Suspense key={location.pathname} fallback={<PageLoader />}> {/* иначе PageLoader отрисуется только один раз и только для одной страницы */}
          <Outlet />{/* перерисовка только этой части, а не всего Layout в отл. от children */}
        </Suspense>
      </main>
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      )}
    </div>
  )
}