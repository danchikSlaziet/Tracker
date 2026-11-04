import styles from './RegisterPage.module.css'
import { RegisterForm } from '@/features/auth'
import { ThemeSwitcher } from '@/features/theme'
import { PageMeta } from '@/shared/ui/PageMeta'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <PageMeta title="Регистрация" description="Создание нового аккаунта в Finance Tracker" />
      <ThemeSwitcher className={styles.themeBtn} />
      <img className={styles.mark} src="/favicon.svg" alt="Finance" width={40} height={40} />
      <RegisterForm />
    </div>
  )
}