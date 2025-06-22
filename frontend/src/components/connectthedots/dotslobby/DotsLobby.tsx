import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button } from '@mui/material'
import { socket } from '../socket'
import Chatroom from './chatroom/Chatroom'
import Gamearea from './gamearea/Gamearea'
import Scorecard from './scorecard/ScoreCard'

type LobbyInfo = {
  players: string[]
  lobbyId: string
  current_user?: string
}

const DotsLobby = () => {
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>({
    players: [],
    lobbyId: '',
    current_user: '',
  })
  const { userId, lobbyId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Connect the Dots - Lobby'

    // Request lobby info
    socket.emit('getLobbyInfo', { lobbyId, userId })

    socket.on('lobbyInfo', (data) => {
      setLobbyInfo(data)
    })

    socket.on('lobbyUpdate', (data) => {
      setLobbyInfo((prev) => ({
        ...prev,
        players: data.players,
      }))
    })

    socket.on('error', (err) => {
      console.error('Socket error:', err)
    })

    return () => {
      socket.off('lobbyInfo')
      socket.off('lobbyUpdate')
      socket.off('error')
    }
  }, [])

  const handleLeaveLobby = () => {
    const userName = lobbyInfo.current_user
    socket.emit('leaveLobby', { lobbyId, userName })

    socket.on('leftLobby', (data) => {
      // setLobbyInfo({ ...lobbyInfo, players: data.players })
      // Navigate to dashboard after leaving
      navigate(`/${userId}/dashboard`)
    })

    socket.off('lobbyUpdate') // Clean up listener after leaving
  }

  return (
    <div style={{ display: 'flex', height: '80vh', width: '100%', gap: 16 }}>
      {/* Left: Players Joined */}
      <div
        style={{
          width: 400,
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Scorecard
          username={lobbyInfo.current_user as string}
          lobbyId={lobbyId as string}
        />
        <h3 style={{ marginTop: 24 }}>Players</h3>
        <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
          {lobbyInfo.players.length !== 0 &&
            lobbyInfo.players.map((player, index) => {
              const currentUserName = lobbyInfo.current_user
              const isCurrentUser = player === currentUserName
              return (
                <li key={index}>
                  <span role="img" aria-label="player">
                    👤
                  </span>{' '}
                  <span
                    style={
                      isCurrentUser ? { color: 'green', fontWeight: 700 } : {}
                    }
                  >
                    {player}
                  </span>
                </li>
              )
            })}
        </ul>
        <div style={{ marginTop: 'auto', fontWeight: 500 }}>
          Joined: {lobbyInfo.players.length}
        </div>
      </div>

      {/* Middle: Game Area */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minWidth: 0,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: 700,
            color: '#1976d2',
            mb: 2,
            letterSpacing: 1,
          }}
        >
          Lobby ID: {lobbyInfo.lobbyId}
        </Typography>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Gamearea
            lobbyId={lobbyId as string}
            username={lobbyInfo.current_user || ''}
          />
        </div>
        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={handleLeaveLobby}
        >
          Leave Lobby
        </Button>
      </div>

      {/* Right: Chat Room */}
      <Chatroom
        userName={lobbyInfo.current_user || ''}
        lobbyId={lobbyId as string}
        socket={socket}
      />
    </div>
  )
}

export default DotsLobby
