// import { defineConfig } from 'vite'
import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const plugins: any[] = [react()]

  if (env.SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: '123-aow',
        project: 'finance-tracker',
      })
    )
  }

  if (process.env.ANALYZE === 'true') {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html', // имя файла отчета
        open: true,                  // автоматически открыть отчет в браузере после сборки
        gzipSize: true,
        brotliSize: true,
      })
    )
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: true, // генерация source maps для Sentry
    },
    test: {
      globals: true, // describe/it и т.д. без импортов
      environment: 'jsdom', // вирт. браузер
      setupFiles: './src/setupTests.ts', // кастомные проверки (там jest-dom matchers)
      exclude: [...configDefaults.exclude, 'e2e/**'], // иначе vitest тесты прогоняют и playwright
    }
  }
})
