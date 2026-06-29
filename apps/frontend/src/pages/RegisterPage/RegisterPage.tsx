import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle'
import styles from './RegisterPage.module.css'
import { RegisterForm } from '@/features/auth/ui/RegisterForm/RegisterForm'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <ThemeToggle className={styles.themeBtn} />
      <RegisterForm />
    </div>
  )
}