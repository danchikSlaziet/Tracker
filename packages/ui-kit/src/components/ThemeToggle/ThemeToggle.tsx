import styles from './ThemeToggle.module.css'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
  className?: string
}

export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  return (
    <button 
      className={`${styles.themeToggle} ${className || ''}`} 
      onClick={onToggle}
      aria-label="Переключить тему"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}