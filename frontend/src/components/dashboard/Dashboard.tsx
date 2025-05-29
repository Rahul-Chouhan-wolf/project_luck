import { useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
} from '@mui/material'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // Check for JWT token in cookies
  useEffect(() => {
    const token = Cookies.get('jwtToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    Cookies.remove('jwtToken')
    navigate('/login')
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to your Dashboard!
          </Typography>
          <Typography variant="body1">
            Here you can manage your account and view your information.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Dashboard
