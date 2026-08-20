import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'
import { ThemeSwitcher } from '@/features/theme'
import { PageMeta } from '@/shared/ui/PageMeta'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <PageMeta title="Вход" description="Вход в личный кабинет Finance Tracker" />
      <ThemeSwitcher className={styles.themeBtn} />
      <LoginForm />
    </div>
  )
}