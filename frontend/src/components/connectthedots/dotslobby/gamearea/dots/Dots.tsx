import React from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// --- Styled Dot Component ---
const DotStyled = styled(Box)(({ theme }) => ({
  width: 10,
  height: 10,
  backgroundColor: theme.palette.grey[700],
  borderRadius: '50%',
  justifySelf: 'center',
  alignSelf: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[900],
  },
}))

// Dot Props
interface DotProps {
  id: number
}

const Dot: React.FC<DotProps> = ({ id }) => {
  return <DotStyled data-dot-id={id} />
}

export default Dot
