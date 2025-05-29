import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})
export default function SignUpPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showError, setShowError] = useState('')
  const navigate = useNavigate()

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  const handleSubmit = (event: any) => {
    event.preventDefault()
    const payload = {
      email: email,
      password: password,
      name: name,
    }
    axios
      .post('api/users/register', payload)
      .then((response: any) => {
        console.log('Signup successful:', response.data.email)
        navigate('/login')
        // Redirect to login or home page
      })
      .catch((error: any) => {
        console.error('Signup error:', error.message)
        setShowError(error.response?.data?.message || 'An error occurred')
        // Handle error (e.g., show a notification)
      })
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            backgroundColor: '#0f172a',
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign up
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {showError && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="body2">
                  {showError}
                </Typography>
              </Box>
            )}
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              name="name"
              onChange={handleNameChange}
              value={name}
              type="text"
              autoComplete="name"
              InputProps={{ sx: { backgroundColor: '#1e293b' } }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              onChange={handleEmailChange}
              value={email}
              type="email"
              autoComplete="email"
              InputProps={{ sx: { backgroundColor: '#1e293b' } }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              onChange={handlePasswordChange}
              value={password}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              InputProps={{
                sx: { backgroundColor: '#1e293b' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={(e) => handleSubmit(e)}
              sx={{ mt: 3, mb: 2, backgroundColor: '#e2e8f0', color: '#000' }}
            >
              Sign up
            </Button>
            <Link href="#" variant="body2" display="block" align="center">
              Forgot your password?
            </Link>

            <Divider sx={{ my: 2 }}>or</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderColor: '#334155',
                '&:hover': {
                  backgroundColor: '#1e293b',
                },
              }}
            >
              Sign in with Google
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
