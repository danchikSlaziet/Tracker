import { Skeleton } from '@/shared/ui/Skeleton'
import styles from './CategoryList.module.css'

export const CategoryListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.left}>
            <Skeleton width={42} height={42} borderRadius={8} />
            <div className={styles.info}>
              <Skeleton width={120} height={16} />
              <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Skeleton width={28} height={28} borderRadius={6} />
            <Skeleton width={28} height={28} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  )
}