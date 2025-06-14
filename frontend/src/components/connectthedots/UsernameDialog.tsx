import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material'

interface UsernameDialogProps {
  open: boolean
  initialValue: string
  onClose: () => void
  onSave: (username: string) => void
  onUpdate: (username: string) => void
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({
  open,
  initialValue,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [username, setUsername] = useState(initialValue)
  const [error, setError] = useState('')

  useEffect(() => {
    setUsername(initialValue)
    setError('')
  }, [initialValue, open])

  const handleSave = () => {
    const name = username.trim()
    if (!name) {
      setError('Username cannot be empty')
      return
    }
    initialValue ? onUpdate(name) : onSave(name)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {initialValue ? 'Update Username' : 'Create Username'}
      </DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error}
            helperText={error}
            inputProps={{ maxLength: 24 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {initialValue ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UsernameDialog
