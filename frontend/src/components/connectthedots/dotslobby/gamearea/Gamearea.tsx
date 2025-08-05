import { Typography } from '@mui/material'
import GameBoard from './gameboard/GameBoard'

interface GameareaProps {
  lobbyId: string
  username: string
}

const Gamearea: React.FC<GameareaProps> = ({ lobbyId, username }) => {
  return (
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
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <GameBoard username={username} lobbyId={lobbyId} />
      </div>
    </div>
  )
}

export default Gamearea
