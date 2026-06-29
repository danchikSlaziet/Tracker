// import { defineConfig } from 'vite'
import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true, // describe/it и т.д. без импортов
    environment: 'jsdom', // вирт. браузер
    setupFiles: './src/setupTests.ts', // кастомные проверки (там jest-dom matchers)
    exclude: [...configDefaults.exclude, 'e2e/**'], // иначе vitest тесты прогоняют и playwright
  }
})
