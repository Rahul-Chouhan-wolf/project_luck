import { Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

export default UserRoutes
