import { VerifyForm } from "@/features/auth"
import styles from './VerifyPage.module.css'
import { ThemeSwitcher } from "@/features/theme"
import { PageMeta } from "@/shared/ui/PageMeta"

export const VerifyPage = () => {
  return (
    <main className={styles.pageWrapper}>
      <PageMeta title="Подтверждение почты" description="Подтверждение email адреса аккаунта" />
      <ThemeSwitcher className={styles.themeBtn} />
      <img className={styles.mark} src="/favicon.svg" alt="Finance" width={40} height={40} />
      <VerifyForm />
    </main>
  )
}