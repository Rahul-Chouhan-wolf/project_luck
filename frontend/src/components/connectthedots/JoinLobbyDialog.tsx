import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material'

interface JoinLobbyDialogProps {
  open: boolean
  onJoin: (lobbyId: string) => void
  onCancel: () => void
}

const JoinLobbyDialog: React.FC<JoinLobbyDialogProps> = ({
  open,
  onJoin,
  onCancel,
}) => {
  const [lobbyId, setLobbyId] = useState('')

  const handleJoin = () => {
    onJoin(lobbyId)
    setLobbyId('')
  }

  const handleCancel = () => {
    onCancel()
    setLobbyId('')
  }

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Join Lobby</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Lobby ID"
          type="text"
          fullWidth
          value={lobbyId}
          onChange={(e) => setLobbyId(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleJoin}
          color="primary"
          disabled={!lobbyId.trim()}
          variant="contained"
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default JoinLobbyDialog
