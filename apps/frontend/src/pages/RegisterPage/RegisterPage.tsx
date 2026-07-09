import styles from './RegisterPage.module.css'
import { RegisterForm } from '@/features/auth/ui/RegisterForm/RegisterForm'
import { ThemeSwitcher } from '@/features/theme/ui/ThemeSwitcher/ThemeSwitcher'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <ThemeSwitcher className={styles.themeBtn} />
      <RegisterForm />
    </div>
  )
}