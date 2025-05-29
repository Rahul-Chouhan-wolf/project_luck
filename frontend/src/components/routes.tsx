import { Routes, Route } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'

const AppRoutes = () => (
  <Routes>
    <Route path="/:userId/dashboard" element={<Dashboard />} />
  </Routes>
)

export default AppRoutes
