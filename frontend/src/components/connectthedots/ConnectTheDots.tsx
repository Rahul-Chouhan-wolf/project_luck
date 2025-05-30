import { Box, Button, Paper, Typography } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import UsernameDialog from './UsernameDialog'

const ConnectTheDots = () => {
  const [userName, setUserName] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { userId } = useParams()
  useEffect(() => {
    document.title = 'Connect the Dots - Game Lobby'
    axios
      .get(`/${userId}/connectDots/getUserName`)
      .then((response) => {
        if (response.data && response.data.userName) {
          setUserName(response.data.userName)
        } else {
          console.error('User name not found in response')
        }
      })
      .catch((error) => {
        console.error('Error fetching user name:', error)
      })
  }, [])

  const handleSaveUsername = (newUserName: string) => {
    axios
      .post(`/${userId}/connectDots/createUserName`, {
        userName: newUserName,
        userId: userId,
      })
      .then((response) => {
        setUserName(response.data.userName)
        setDialogOpen(false)
      })
      .catch((error) => {
        console.error('Error saving username:', error)
      })
  }

  const handleUpdateUsername = (newUserName: string) => {
    axios
      .put(`/${userId}/connectDots/updateUserName`, {
        userName: newUserName,
        userId: userId,
      })
      .then((response) => {
        setUserName(response.data.userName)
        setDialogOpen(false)
      })
      .catch((error) => {
        console.error('Error saving username:', error)
      })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 6,
          borderRadius: 3,
          minWidth: 340,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.95)',
        }}
      >
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#38bdf8',
            letterSpacing: 2,
            mb: 4,
            textShadow: '0 2px 8px #0ea5e9',
          }}
        >
          Connect the Dots
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
            width: '100%',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: '#38bdf8', mb: 1, fontWeight: 500, letterSpacing: 1 }}
          >
            {userName && `Welcome to Connect the Dots ${userName}`}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              fontWeight: 600,
              fontSize: 15,
              px: 2,
              py: 1.2,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
              boxShadow: '0 2px 8px rgba(56,189,248,0.12)',
              minWidth: 180,
              textTransform: 'none',
              mb: 1,
            }}
            onClick={() => setDialogOpen(true)}
          >
            {userName ? 'Update Username' : 'Create Username'}
          </Button>
          {/* Dialog for username input */}
          <UsernameDialog
            open={dialogOpen}
            initialValue={userName}
            onClose={() => setDialogOpen(false)}
            onSave={handleSaveUsername}
            onUpdate={handleUpdateUsername}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: 220,
            mb: 2,
            fontWeight: 600,
            fontSize: 18,
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)',
            boxShadow: '0 4px 20px rgba(14,165,233,0.15)',
          }}
        >
          Create Lobby
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{
            width: 220,
            fontWeight: 600,
            fontSize: 18,
            py: 1.5,
            borderRadius: 2,
            borderColor: '#38bdf8',
            color: '#38bdf8',
            '&:hover': {
              borderColor: '#0ea5e9',
              background: 'rgba(56,189,248,0.08)',
            },
          }}
        >
          Join the Lobby
        </Button>
      </Paper>
    </Box>
  )
}

export default ConnectTheDots
