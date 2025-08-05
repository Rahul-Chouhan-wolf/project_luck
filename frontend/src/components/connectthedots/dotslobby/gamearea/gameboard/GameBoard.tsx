// src/components/GameBoard.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import Dot from '../dots/Dots'
import { socket } from '../../../socket'
import './GameBoard.css'

interface GameBoardProps {
  gridSize?: number
  username?: string
  lobbyId?: string
}

type Connection = { from: number; to: number; player: string }

interface GameState {
  connections: Connection[]
  currentTurn: string
  players: string[]
  gameStarted: boolean
  completedBoxes: [string, { owner: string; color: string }][]
  gridSize: number
}

interface PlayerScore {
  username: string
  score: number
  color: string
  connectedDots: number
}

interface CompletedBox {
  id: string
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
  row: number
  col: number
}

const GameBoard: React.FC<GameBoardProps> = ({
  gridSize = 10,
  username = '',
  lobbyId = '',
}) => {
  const [connections, setConnections] = useState<Connection[]>([])
  const [currentTurn, setCurrentTurn] = useState<string>('')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string>('')
  const [gameComplete, setGameComplete] = useState<boolean>(false)
  const [finalScores, setFinalScores] = useState<PlayerScore[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [completedBoxes, setCompletedBoxes] = useState<
    Map<string, { owner: string; color: string }>
  >(new Map())
  const dots = Array.from({ length: gridSize * gridSize }, (_, index) => index)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lobbyId) return

    // Get current game state
    socket.emit('getGameState', { lobbyId })

    // Listen for game state updates
    socket.on('gameState', (state: GameState) => {
      setGameState(state)
      setConnections(state.connections)
      setCurrentTurn(state.currentTurn)
      setCompletedBoxes(new Map(state.completedBoxes))
    })

    // Listen for moves made by other players
    socket.on(
      'moveMade',
      (data: {
        from: number
        to: number
        player: string
        connections: Connection[]
        currentTurn: string
        completedBoxes: [string, { owner: string; color: string }][]
        boxCompleted: boolean
        boxOwner: string | null
        scores: Record<string, number>
      }) => {
        setConnections(data.connections)
        setCurrentTurn(data.currentTurn)
        setCompletedBoxes(new Map(data.completedBoxes))
        setError('')

        if (data.boxCompleted && data.boxOwner) {
          // Show notification for box completion
          console.log(`Box completed by ${data.boxOwner}!`)
        }
      }
    )

    // Listen for game completion
    socket.on('gameComplete', (data: { scores: PlayerScore[] }) => {
      setGameComplete(true)
      setFinalScores(data.scores)
      setShowResults(true)
      setError('')
    })

    // Listen for errors
    socket.on('error', (err: { message: string }) => {
      setError(err.message)
    })

    return () => {
      socket.off('gameState')
      socket.off('moveMade')
      socket.off('gameComplete')
      socket.off('error')
    }
  }, [lobbyId])

  // Get row and col from dot index
  const getRowCol = (index: number) => ({
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  })

  // Only allow vertical/horizontal connections
  const canConnect = (from: number, to: number) => {
    if (from === to) return false
    const a = getRowCol(from)
    const b = getRowCol(to)
    return a.row === b.row || a.col === b.col
  }

  // Prevent duplicate connections
  const isConnected = (from: number, to: number) =>
    connections.some(
      (c) =>
        (c.from === from && c.to === to) || (c.from === to && c.to === from)
    )

  // Called by Dot when user draws a line to another dot
  const handleConnect = (from: number, to: number) => {
    if (!lobbyId || !username) return

    // Check if it's the user's turn
    if (currentTurn !== username) {
      setError("It's not your turn!")
      return
    }

    // Validate move
    if (!canConnect(from, to)) {
      setError(
        'Invalid connection! Only horizontal and vertical connections are allowed.'
      )
      return
    }

    if (isConnected(from, to)) {
      setError('Connection already exists!')
      return
    }

    // Clear any previous errors
    setError('')

    // Send move to server
    socket.emit('makeMove', { lobbyId, userName: username, from, to })
  }

  // Calculate dot center positions for SVG lines
  const getDotCenter = (index: number) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    // These values should match your grid cell size and gap
    const cellWidth = 21 + 20 // width + gap
    const cellHeight = 24 + 20 // height + gap
    const offsetX = 10 + 16 // padding + dot radius
    const offsetY = 10 + 17
    return {
      x: col * cellWidth + offsetX,
      y: row * cellHeight + offsetY,
    }
  }

  // Get box center position for displaying user initials
  const getBoxCenter = (row: number, col: number) => {
    const cellWidth = 21 + 20 // width + gap
    const cellHeight = 24 + 20 // height + gap
    const offsetX = 10 + 16 // padding + dot radius
    const offsetY = 10 + 17
    return {
      x: col * cellWidth + offsetX + cellWidth / 2,
      y: row * cellHeight + offsetY + cellHeight / 2,
    }
  }

  // Get board offset for SVG
  const getBoardOffset = () => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect()
      return { left: rect.left, top: rect.top }
    }
    return { left: 0, top: 0 }
  }

  const boardOffset = getBoardOffset()
  const isMyTurn = currentTurn === username

  return (
    <>
      <Paper
        elevation={3}
        className="game-board-container"
        style={{ position: 'relative' }}
      >
        {/* Game Status */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          {gameComplete ? (
            <Alert severity="success" sx={{ mb: 1 }}>
              Game Complete! Check the results below.
            </Alert>
          ) : (
            <Typography
              variant="h6"
              color={isMyTurn ? 'primary' : 'text.secondary'}
            >
              {isMyTurn ? "It's your turn!" : `Waiting for ${currentTurn}...`}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>

        <div
          ref={boardRef}
          style={{ position: 'relative', width: 421, height: 451 }}
        >
          {/* SVG lines */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {connections.map((conn, idx) => {
              const from = getDotCenter(conn.from)
              const to = getDotCenter(conn.to)
              return (
                <line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={conn.player === username ? '#1976d2' : '#ff9800'}
                  strokeWidth={3}
                />
              )
            })}
          </svg>

          {/* Completed boxes with user initials */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {Array.from(completedBoxes.entries()).map(([boxId, boxData]) => {
              const [row, col] = boxId.split('-').map(Number)
              const center = getBoxCenter(row, col)
              const initials = boxData.owner.substring(0, 2).toUpperCase()

              return (
                <g key={boxId}>
                  <rect
                    x={center.x - 15}
                    y={center.y - 15}
                    width={30}
                    height={30}
                    fill={boxData.color}
                    opacity={0.3}
                    rx={3}
                  />
                  <text
                    x={center.x}
                    y={center.y + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={boxData.color}
                  >
                    {initials}
                  </text>
                </g>
              )
            })}
          </svg>

          <Box
            className="game-grid"
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 21px)`,
              gridTemplateRows: `repeat(${gridSize}, 24px)`,
              gap: '20px',
              justifyContent: 'center',
              alignContent: 'center',
              border: '1px solid',
              borderColor: 'grey.300',
              padding: 2,
              width: 'fit-content',
              position: 'relative',
              zIndex: 2,
              opacity: gameComplete ? 0.7 : 1,
              pointerEvents: gameComplete ? 'none' : 'auto',
            }}
          >
            {dots.map((dotIndex) => (
              <Dot
                key={dotIndex}
                id={dotIndex}
                onConnect={handleConnect}
                gridSize={gridSize}
                disabled={!isMyTurn || gameComplete}
              />
            ))}
          </Box>
        </div>
      </Paper>

      {/* Game Results Dialog */}
      <Dialog
        open={showResults}
        onClose={() => setShowResults(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Game Complete!</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Final Results:
          </Typography>
          <Box sx={{ mt: 2 }}>
            {finalScores.map((player, index) => (
              <Box
                key={player.username}
                sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
              >
                <Typography variant="h6" sx={{ mr: 1 }}>
                  #{index + 1}
                </Typography>
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: player.color,
                    marginRight: 8,
                  }}
                />
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {player.username}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {player.score} boxes completed
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GameBoard
