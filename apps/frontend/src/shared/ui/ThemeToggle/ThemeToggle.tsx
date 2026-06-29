import { useThemeStore } from "@/shared/lib/useThemeStore"
import styles from './ThemeToggle.module.css'

interface Props {
  className?: string
}

export function ThemeToggle({ className }: Props) {
  const { theme, toggleTheme } = useThemeStore()

  return <button className={`${styles.themeToggle} ${className}`} onClick={toggleTheme}>
    {theme === 'light' ? '🌙' : '☀️'}
  </button>
}