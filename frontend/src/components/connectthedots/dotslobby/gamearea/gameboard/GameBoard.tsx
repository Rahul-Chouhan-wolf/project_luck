// src/components/GameBoard.tsx
import React, { useState, useRef } from 'react'
import { Box, Paper } from '@mui/material'
import Dot from '../dots/Dots'
import './GameBoard.css'

interface GameBoardProps {
  gridSize?: number
  username?: string
}

type Connection = { from: number; to: number }

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 10 }) => {
  const [connections, setConnections] = useState<Connection[]>([])
  const dots = Array.from({ length: gridSize * gridSize }, (_, index) => index)
  const boardRef = useRef<HTMLDivElement>(null)

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
    if (canConnect(from, to) && !isConnected(from, to)) {
      setConnections((prev) => [...prev, { from, to }])
    }
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

  // Get board offset for SVG
  const getBoardOffset = () => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect()
      return { left: rect.left, top: rect.top }
    }
    return { left: 0, top: 0 }
  }

  const boardOffset = getBoardOffset()

  return (
    <Paper
      elevation={3}
      className="game-board-container"
      style={{ position: 'relative' }}
    >
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
                stroke="#1976d2"
                strokeWidth={3}
              />
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
          }}
        >
          {dots.map((dotIndex) => (
            <Dot
              key={dotIndex}
              id={dotIndex}
              onConnect={handleConnect}
              gridSize={gridSize}
            />
          ))}
        </Box>
      </div>
    </Paper>
  )
}

export default GameBoard
