import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import { useLogout, useMe } from '@/features/auth'
import { ROUTES } from '@/shared/config'
import { Suspense, useState } from 'react'
import { PageLoader, Avatar } from '@finance/ui-kit'
import { ProfileModal } from '@/features/profile'
import { ThemeSwitcher } from '@/features/theme'
import { AssistantModal, useAssistantStore } from '@/features/ai-assistant'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'

export function Layout() {
  const { mutate: logout, isPending } = useLogout()
  const { data: authData } = useMe()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const location = useLocation()
  const user = authData?.user

  const handleNavClick = () => {
    setIsMobileOpen(false)
  }

  const { setIsOpen: setIsAssistantOpen } = useAssistantStore()


  return (
    <div className={`${styles.root} ${isCollapsed ? styles.rootCollapsed : ''}`}>
      {/* бургер меню */}
      <header className={styles.mobileHeader}>
        <button
          className={styles.burgerBtn}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Меню"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={styles.logo}>Finance</div>
        <div className={styles.mobileHeaderRight}>
          <ThemeSwitcher />
          {user && (
            <div className={styles.mobileAvatar} onClick={() => setIsProfileOpen(true)}>
              <Avatar src={user.avatarUrl} email={user.email} size="sm" />
            </div>
          )}
        </div>
      </header>

      {/* Затемнение фона при открытии меню на мобилке */}
      {isMobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Единый Сайдбар */}
      <aside
        className={`
          ${styles.sidebar}
          ${isMobileOpen ? styles.mobileOpen : ''}
          ${isCollapsed ? styles.sidebarCollapsed : ''}
        `}
      >
        <div className={styles.sidebarHeader}>
          {!isCollapsed && <div className={styles.logo}>Finance</div>}
          <button
            className={styles.collapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to={ROUTES.HOME}
            onClick={handleNavClick}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
            title="Дашборд"
          >
            <span className={styles.navIcon}><LayoutDashboard size={18} /></span>
            {!isCollapsed && <span className={styles.navText}>Дашборд</span>}
          </NavLink>
          <NavLink
            to={ROUTES.TRANSACTIONS}
            onClick={handleNavClick}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
            title="Транзакции"
          >
            <span className={styles.navIcon}><ArrowLeftRight size={18} /></span>
            {!isCollapsed && <span className={styles.navText}>Транзакции</span>}
          </NavLink>
          <NavLink
            to={ROUTES.CATEGORIES}
            onClick={handleNavClick}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
            title="Категории"
          >
            <span className={styles.navIcon}><Tag size={18} /></span>
            {!isCollapsed && <span className={styles.navText}>Категории</span>}
          </NavLink>
          <button
            type="button"
            onClick={() => {
              setIsAssistantOpen(true)
              handleNavClick()
            }}
            className={styles.navLink}
            title="AI Ассистент"
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            <span className={styles.navIcon} style={{ color: '#8b5cf6' }}>
              <Sparkles size={18} />
            </span>
            {!isCollapsed && (
              <span className={styles.navText} style={{ fontWeight: 600, color: '#8b5cf6' }}>
                AI Ассистент
              </span>
            )}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.themeRow}>
            <ThemeSwitcher />
          </div>

          {user && (
            <div
              className={styles.profileBlock}
              onClick={() => {
                setIsProfileOpen(true)
                setIsMobileOpen(false)
              }}
              title={user.email}
            >
              <Avatar src={user.avatarUrl} email={user.email} size="sm" />
              {!isCollapsed && (
                <span className={styles.profileEmail}>{user.email}</span>
              )}
            </div>
          )}

          <button
            onClick={() => logout()}
            disabled={isPending}
            className={styles.logoutBtn}
            title="Выйти"
          >
            <span className={styles.logoutIcon}><LogOut size={18} /></span>
            {!isCollapsed && <span>{isPending ? 'Выход...' : 'Выйти'}</span>}
          </button>
        </div>
      </aside>

      {/* контент */}
      <main className={styles.main}>
        <Suspense key={location.pathname} fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      )}

      <AssistantModal />
    </div>
  )
}