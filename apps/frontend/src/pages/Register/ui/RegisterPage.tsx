import styles from './RegisterPage.module.css'
import { RegisterForm } from '@/features/auth'
import { ThemeSwitcher } from '@/features/theme'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <ThemeSwitcher className={styles.themeBtn} />
      <RegisterForm />
    </div>
  )
}