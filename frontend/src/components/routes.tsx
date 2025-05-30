import { Routes, Route } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import ConnectTheDots from './connectthedots/ConnectTheDots'

const AppRoutes = () => (
  <Routes>
    <Route path="/:userId/dashboard" element={<Dashboard />} />
    <Route path="/:userId/connect-dots" element={<ConnectTheDots />} />
  </Routes>
)

export default AppRoutes
