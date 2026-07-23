import { VerifyForm } from "@/features/auth"
import styles from './VerifyPage.module.css'
import { ThemeSwitcher } from "@/features/theme"

export const VerifyPage = () => {
  return (
    <main className={styles.pageWrapper}>
      <ThemeSwitcher className={styles.themeBtn} />
      <VerifyForm />
    </main>
  )
}