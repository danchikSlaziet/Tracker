import { Skeleton } from '@/shared/ui/Skeleton'
import styles from './TransactionList.module.css'

export const TransactionListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className={styles.rows}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.transactionCard}>
          <div className={styles.iconBox}>
            <Skeleton width={18} height={18} borderRadius={4} />
          </div>
          <div className={styles.contentBody}>
            <div className={styles.topRow}>
              <Skeleton width={120} height={16} />
              <Skeleton width={70} height={16} />
            </div>
            <div className={styles.bottomRow}>
              <Skeleton width={90} height={20} borderRadius={6} />
              <Skeleton width={50} height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}