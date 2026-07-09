import { ThemeToggle } from '@finance/ui-kit'
import { useThemeStore } from '@/shared/lib/useThemeStore'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()
  return <ThemeToggle theme={theme} onToggle={toggleTheme} className={className} />
}