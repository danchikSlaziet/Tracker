import { useState } from 'react'
import styles from './Avatar.module.css'

interface AvatarProps {
  src?: string | null
  email: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const getInitials = (email: string) => {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

export function Avatar({ src, email, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = useState(false)

  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setHasError(false)
  } // при useEffect(..., [src]) лишний рендер, линтер не пропустит


  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '')
  const fullSrc = src ? `${baseUrl}${src}` : null
  const sizeClass = styles[size] || styles.md

  if (fullSrc && !hasError) {
    return (
      <img
        src={fullSrc}
        alt={`Аватар ${email}`}
        className={[styles.avatar, styles.image, sizeClass, className].filter(Boolean).join(' ')}
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <div
      className={[styles.avatar, styles.initials, sizeClass, className].filter(Boolean).join(' ')}
    >
      {getInitials(email)}
    </div>
  )
}