import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Трассировка производительности
    tracesSampleRate: 1.0, // 100% - на каждый пук отправляем аналитику

    // Запись видео-повторов сессий
    replaysSessionSampleRate: 0.1, // 10% обычных сессий
    replaysOnErrorSampleRate: 1.0, // 100% сессий с ошибками 
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
