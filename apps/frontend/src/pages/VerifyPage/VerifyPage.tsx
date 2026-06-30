import { VerifyForm } from "@/features/auth/ui/VerifyForm/VerifyForm"
import styles from './VerifyPage.module.css'

export const VerifyPage = () => {
  return(
    <main className={styles.pageWrapper}>
      <VerifyForm />
    </main>
  )
}