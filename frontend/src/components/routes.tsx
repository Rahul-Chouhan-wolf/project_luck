import { Routes, Route } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import ConnectTheDots from './connectthedots/ConnectTheDots'
import DotsLobby from './connectthedots/dotslobby/DotsLobby'

const AppRoutes = () => (
  <Routes>
    <Route path="/:userId/dashboard" element={<Dashboard />} />
    <Route path="/:userId/connectDots" element={<ConnectTheDots />} />
    <Route path="/:userId/connectDots/:lobbyId" element={<DotsLobby />} />
  </Routes>
)

export default AppRoutes
