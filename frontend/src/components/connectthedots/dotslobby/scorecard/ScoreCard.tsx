import React, { useEffect, useState } from 'react'
import { socket } from '../../socket'

interface PlayerScore {
  username: string
  score: number
  color: string
}

interface ScoreCardProps {
  username: string
  lobbyId: string
}

const ScoreCard: React.FC<ScoreCardProps> = ({ username, lobbyId }) => {
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Request lobby info
    socket.emit('getScoreCard', { lobbyId })

    socket.on('scoreCardInfo', (data) => {
      setScores(data.scorecard)
      setLoading(false)
    })
  }, [])

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
            <th style={{ textAlign: 'right' }}>Score</th>
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
                    color: player.color,
                    marginRight: 8,
                  }}
                />
                {player.username}
              </td>
              <td style={{ textAlign: 'center' }}>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScoreCard
