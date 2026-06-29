import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

export interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      }))
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)