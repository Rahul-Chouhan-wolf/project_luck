import React from 'react'
import { styled } from '@mui/material/styles'

const DotStyled = styled('button')(({ theme }) => ({
  width: 10,
  height: 10,
  backgroundColor: theme.palette.grey[700],
  borderRadius: '50%',
  justifySelf: 'center',
  alignSelf: 'center',
  cursor: 'pointer',
  border: 'none',
  padding: 0,
  outline: 'none',
  '&:hover': {
    backgroundColor: theme.palette.grey[900],
  },
}))

interface DotProps {
  id: number
  onConnect: (from: number, to: number) => void
  gridSize: number
}

const Dot: React.FC<DotProps> = ({ id, onConnect }) => {
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [lineEnd, setLineEnd] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const dotRef = React.useRef<HTMLButtonElement>(null)

  // Start drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    setLineEnd({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Update line end
  const handleMouseMove = (e: MouseEvent) => {
    setLineEnd({ x: e.clientX, y: e.clientY })
  }

  // Finish drawing
  const handleMouseUp = (e: MouseEvent) => {
    setIsDrawing(false)
    setLineEnd(null)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    // Check if mouse is over another dot
    const target = document.elementFromPoint(e.clientX, e.clientY)
    if (target && target instanceof HTMLButtonElement && target.dataset.dotId) {
      const toId = Number(target.dataset.dotId)
      if (toId !== id) {
        onConnect(id, toId)
      }
    }
  }

  return (
    <>
      <DotStyled ref={dotRef} data-dot-id={id} onMouseDown={handleMouseDown} />
      {isDrawing && lineEnd && (
        <svg
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          width={window.innerWidth}
          height={window.innerHeight}
        >
          {/* Optionally, you can calculate the dot's center for better accuracy */}
          <line
            x1={
              window.scrollX +
              (dotRef.current?.getBoundingClientRect().left ?? 0) +
              5
            }
            y1={
              window.scrollY +
              (dotRef.current?.getBoundingClientRect().top ?? 0) +
              5
            }
            x2={lineEnd.x}
            y2={lineEnd.y}
            stroke="#1976d2"
            strokeWidth={3}
          />
        </svg>
      )}
    </>
  )
}

export default Dot
