import { VerifyForm } from "@/features/auth"
import styles from './VerifyPage.module.css'
import { ThemeSwitcher } from "@/features/theme"
import { PageMeta } from "@/shared/ui/PageMeta"

export const VerifyPage = () => {
  return (
    <main className={styles.pageWrapper}>
      <PageMeta title="Подтверждение почты" description="Подтверждение email адреса аккаунта" />
      <ThemeSwitcher className={styles.themeBtn} />
      <VerifyForm />
    </main>
  )
}