import { VerifyForm } from "@/features/auth"
import styles from './VerifyPage.module.css'

export const VerifyPage = () => {
  return(
    <main className={styles.pageWrapper}>
      <VerifyForm />
    </main>
  )
}