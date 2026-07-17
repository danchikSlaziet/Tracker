import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'
import { ThemeSwitcher } from '@/features/theme'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <ThemeSwitcher className={styles.themeBtn} />
      <LoginForm />
    </div>
  )
}