import React, { useEffect, useState } from 'react'
import { socket } from '../../socket'

interface PlayerScore {
  username: string
  score: number
  color: string
  connectedDots: number
}

interface ScoreCardProps {
  username: string
  lobbyId: string
}

const ScoreCard: React.FC<ScoreCardProps> = ({ username, lobbyId }) => {
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScoreCard = () => {
    socket.emit('getScoreCard', { lobbyId })
  }

  useEffect(() => {
    // Request score card
    fetchScoreCard()

    const handleScoreCardInfo = (data: {
      lobbyId: string
      scorecard: PlayerScore[]
    }) => {
      setScores(data.scorecard)
      setLoading(false)
    }

    const handleMoveMade = (data: {
      from: number
      to: number
      player: string
      score: number
    }) => {
      // Refresh score card when a move is made
      fetchScoreCard()
    }

    const handleGameComplete = (data: { scores: PlayerScore[] }) => {
      setScores(data.scores)
      setLoading(false)
    }

    socket.on('scoreCardInfo', handleScoreCardInfo)
    socket.on('moveMade', handleMoveMade)
    socket.on('gameComplete', handleGameComplete)

    return () => {
      socket.off('scoreCardInfo', handleScoreCardInfo)
      socket.off('moveMade', handleMoveMade)
      socket.off('gameComplete', handleGameComplete)
    }
  }, [lobbyId])

  if (loading) {
    return <div>Loading scorecard...</div>
  }

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: 16,
        width: 320,
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        zIndex: 10,
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        fontSize: 14,
        lineHeight: 1.5,
        overflowY: 'auto',
        maxHeight: '80vh',
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f9f9f9',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <h3>Score:</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Player</th>
            <th style={{ textAlign: 'center' }}>Score</th>
            <th style={{ textAlign: 'center' }}>Boxes</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((player) => (
            <tr
              key={player.username}
              style={{
                color: player.color,
              }}
            >
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: player.color,
                    marginRight: 8,
                  }}
                />
                {player.username}
              </td>
              <td style={{ textAlign: 'center' }}>{player.score}</td>
              <td style={{ textAlign: 'center' }}>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScoreCard
