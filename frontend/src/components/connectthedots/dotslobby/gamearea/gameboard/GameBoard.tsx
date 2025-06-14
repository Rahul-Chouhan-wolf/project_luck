// src/components/GameBoard.tsx
import React from 'react'
import { Box, Paper } from '@mui/material'
import Dot from '../dots/Dots' // <-- Import Dot from new file
import './GameBoard.css'

interface GameBoardProps {
  gridSize?: number
}

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 10 }) => {
  const dots = Array.from({ length: gridSize * gridSize }, (_, index) => index)

  return (
    <Paper elevation={3} className="game-board-container">
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
          width: '600px',
        }}
      >
        {dots.map((dotIndex) => (
          <Dot key={dotIndex} id={dotIndex} />
        ))}
      </Box>
    </Paper>
  )
}

export default GameBoard
