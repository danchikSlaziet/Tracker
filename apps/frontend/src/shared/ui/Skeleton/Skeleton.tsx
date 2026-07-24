import SkeletonComponent, { type SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const Skeleton = (props: SkeletonProps) => {
  return (
    <SkeletonComponent
      baseColor="var(--bg-secondary)"
      highlightColor="var(--border-color)"
      {...props}
    />
  )
}