import { Providers } from '@/app/Providers'
import { AppRouter } from '@/app/router'

function App() {
  return (
    <Providers>
      {import.meta.env.DEV && (
        <button
          onClick={() => { throw new Error("Sentry Test Error!") }}
          style={{
            position: 'fixed',
            bottom: 12,
            right: 12,
            zIndex: 9999,
            padding: '6px 10px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.15s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          Тест Sentry
        </button>
      )}
      <AppRouter />
    </Providers>
  )
}

export default App