import { Providers } from '@/app/Providers'
import { AppRouter } from '@/app/router'

function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}

export default App