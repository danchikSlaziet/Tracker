import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'
import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <ThemeToggle className={styles.themeBtn} />
      <LoginForm />
    </div>
  )
}