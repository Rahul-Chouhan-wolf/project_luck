import { BrowserRouter } from 'react-router-dom'
import UserRoutes from './user/routes'
import AppRoutes from './components/routes'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <UserRoutes />
    </BrowserRouter>
  )
}

export default App
