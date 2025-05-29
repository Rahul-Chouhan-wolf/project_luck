import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Paper,
  Link,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  interface LoginResponse {
    token: string
    _id: string
  }

  const handleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Handle login logic here
    event.preventDefault()
    axios
      .post<LoginResponse>('/api/users/login', {
        email: email,
        password: password,
      })
      .then((response) => {
        const token = response.data.token
        const userId = response.data._id // Use _id from backend response
        if (token && userId) {
          Cookies.set('jwtToken', token)
          console.log('Login successful, token stored in cookie:', token)
          navigate(`/${userId}/dashboard`) // Use userId in the route
          // Optionally redirect or update UI here
        } else {
          console.error('Token or userId not found in response')
        }
      })
      .catch((error: unknown) => {
        console.error('Login failed:', error)
      })
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage:
            'url(https://source.unsplash.com/random/1920x1080?nature)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Login
            </Typography>
            <Box component="form" noValidate autoComplete="off">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  sx={{ padding: 1 }}
                >
                  Login
                </Button>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid mt={2} textAlign="center">
                <Typography variant="body2">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" underline="hover">
                    Sign up here
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default LoginPage
