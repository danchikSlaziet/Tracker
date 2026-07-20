import { Providers } from '@/app/Providers'
import { AppRouter } from '@/app/router'

function App() {
  return (
    <Providers>
      <button
        onClick={() => { throw new Error("Sentry Test Error!") }}
        style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, padding: '10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Спровоцировать ошибку Sentry
      </button>
      <AppRouter />
    </Providers>
  )
}

export default App