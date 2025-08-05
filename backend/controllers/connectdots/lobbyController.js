const ConnectDotsLobby = require("../../models/connectdots/lobbyModel")
const ScoreCard = require("../../models/connectdots/scoreCard")
const ConnectDotsUser = require("../../models/connectdots/userModel")

module.exports = (io) => {
  // Store active games in memory for real-time updates
  const activeGames = new Map()

  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id)

    socket.on('createLobby', async ({ userId }) => {
      if (!userId) {
        socket.emit('error', { message: 'User ID is required' })
        return
      }
      
      try {
        const user = await ConnectDotsUser.findOne({ userId })
        if (!user) {
          socket.emit('error', { message: 'User not found' })
          return
        }
        
        const lobbyId = Math.floor(1000 + Math.random() * 9000).toString()
        const lobby = await ConnectDotsLobby.create({
          lobbyId,
          players: [user.userName],
          messages: []
        })

        const lobbyScoreCard = await ScoreCard.create({
          lobby: lobby._id,
          players: [{
            username: user.userName,
            score: 0,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            connectedDots: 0
          }]
        })

        if (!lobbyScoreCard) {
          socket.emit('error', { message: 'Failed to create score card' })
          return
        }
        
        // Associate the score card with the lobby
        lobby.scoreCard = lobbyScoreCard._id
        await lobby.save()

        // Initialize game state
        activeGames.set(lobbyId, {
          connections: [],
          currentTurn: user.userName,
          players: [user.userName],
          gameStarted: false,
          completedBoxes: new Map(), // Track completed boxes
          gridSize: 10
        })

        socket.emit('lobbyCreated', { lobbyId })
        socket.join(lobbyId)
        console.log(`Lobby ${lobbyId} created by user ${user.userName}`)
      } catch (error) {
        console.error('Error creating lobby:', error)
        socket.emit('error', { message: 'Failed to create lobby' })
      }
    })

    socket.on('getLobbyInfo', async ({ lobbyId, userId }) => {
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        const user = await ConnectDotsUser.findOne({ userId })
        
        if (!user) {
          socket.emit('error', { message: 'User not found' })
          return
        }
        
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }
        
        socket.emit('lobbyInfo', {
          lobbyId: lobby.lobbyId,
          players: lobby.players,
          current_user: user.userName,
          createdAt: lobby.createdAt,
        })
      } catch (error) {
        console.error('Error getting lobby info:', error)
        socket.emit('error', { message: 'Failed to get lobby info' })
      }
    })

    socket.on('joinLobby', async ({ lobbyId, userName }) => {
      if (userName === undefined || userName === null || userName.trim() === '') {
        socket.emit('error', { message: 'username can not be empty' })
        return
      }
      
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }

        if (lobby.players.includes(userName)) {
          socket.emit('error', { message: 'User already in lobby' })
          return
        }

        await lobby.updateOne({ $addToSet: { players: userName } })
        const updatedLobby = await ConnectDotsLobby.findOne({ lobbyId })
        
        // Add user to the scorecard with a unique color
        const userColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
        await ScoreCard.updateOne(
          { lobby: lobby._id },
          { $push: { players: { username: userName, score: 0, color: userColor, connectedDots: 0 } } }
        )
        
        socket.join(lobbyId)

        // Update active game state
        const gameState = activeGames.get(lobbyId) || { 
          connections: [], 
          currentTurn: updatedLobby.players[0], 
          players: [], 
          gameStarted: false,
          completedBoxes: new Map(),
          gridSize: 10
        }
        gameState.players = updatedLobby.players
        activeGames.set(lobbyId, gameState)

        // Send current game state to the joining player
        socket.emit('gameState', {
          ...gameState,
          completedBoxes: Array.from(gameState.completedBoxes.entries())
        })

        io.to(lobbyId).emit('lobbyJoined', {
          lobbyId,
          players: updatedLobby.players,
        })

        io.to(lobbyId).emit('lobbyUpdate', {
          lobbyId,
          players: updatedLobby.players,
        })
        
        console.log(`User ${userName} joined lobby ${lobbyId}`)
      } catch (error) {
        console.error('Error joining lobby:', error)
        socket.emit('error', { message: 'Failed to join lobby' })
      }
    })

    socket.on('leaveLobby', async ({ lobbyId, userName }) => {
      console.log(`User ${userName} is leaving lobby ${lobbyId}`)
      if (!lobbyId || !userName) {
        socket.emit('error', { message: 'Lobby ID and user name are required' })
        return
      }
      
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }
        
        await lobby.updateOne({ $pull: { players: userName } })
        await ScoreCard.updateOne(
          { lobby: lobby._id },
          { $pull: { players: { username: userName } } }
        )
        
        const updatedLobby = await ConnectDotsLobby.findOne({ lobbyId })

        // Update active game state
        const gameState = activeGames.get(lobbyId)
        if (gameState) {
          gameState.players = gameState.players.filter(p => p !== userName)
          if (gameState.players.length === 0) {
            activeGames.delete(lobbyId)
          } else {
            activeGames.set(lobbyId, gameState)
          }
        }

        socket.emit('leftLobby', { lobbyId, userName })
        io.to(lobbyId).emit('lobbyUpdate', {
          lobbyId,
          players: updatedLobby.players,
        })
        socket.leave(lobbyId)

        console.log(`User ${userName} left lobby ${lobbyId}`)
      } catch (error) {
        console.error('Error leaving lobby:', error)
        socket.emit('error', { message: 'Failed to leave lobby' })
      }
    })

    // Game-related socket events
    socket.on('makeMove', async ({ lobbyId, userName, from, to }) => {
      try {
        const gameState = activeGames.get(lobbyId)
        if (!gameState) {
          socket.emit('error', { message: 'Game not found' })
          return
        }

        // Check if it's the user's turn
        if (gameState.currentTurn !== userName) {
          socket.emit('error', { message: 'Not your turn' })
          return
        }

        // Validate move
        if (from === to) {
          socket.emit('error', { message: 'Invalid move' })
          return
        }

        // Check if connection already exists
        const connectionExists = gameState.connections.some(
          conn => (conn.from === from && conn.to === to) || (conn.from === to && conn.to === from)
        )
        
        if (connectionExists) {
          socket.emit('error', { message: 'Connection already exists' })
          return
        }

        // Add the connection
        gameState.connections.push({ from, to, player: userName })
        activeGames.set(lobbyId, gameState)

        // Check for box completion
        const completedBoxes = checkForBoxCompletion(gameState.connections, gameState.gridSize)
        const newBoxes = completedBoxes.filter(box => !gameState.completedBoxes.has(box.id))
        
        let boxCompleted = false
        let boxOwner = null

        if (newBoxes.length > 0) {
          // Player gets points for completing boxes
          boxCompleted = true
          boxOwner = userName
          
          // Add completed boxes to game state
          const userColor = await getUserColor(lobbyId, userName)
          newBoxes.forEach(box => {
            gameState.completedBoxes.set(box.id, { owner: userName, color: userColor })
          })
          
          activeGames.set(lobbyId, gameState)
        }

        // Calculate score based on completed boxes
        const playerScores = calculateBoxScores(gameState.completedBoxes, gameState.players)
        
        // Update score in database
        await ScoreCard.updateOne(
          { lobby: (await ConnectDotsLobby.findOne({ lobbyId }))._id, 'players.username': userName },
          { $set: { 'players.$.score': playerScores[userName] || 0 } }
        )

        // If no box was completed, switch turn to next player
        if (!boxCompleted) {
          const currentPlayerIndex = gameState.players.indexOf(userName)
          const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length
          gameState.currentTurn = gameState.players[nextPlayerIndex]
          activeGames.set(lobbyId, gameState)
        }

        // Emit move to all players in the lobby
        io.to(lobbyId).emit('moveMade', {
          from,
          to,
          player: userName,
          connections: gameState.connections,
          currentTurn: gameState.currentTurn,
          completedBoxes: Array.from(gameState.completedBoxes.entries()),
          boxCompleted,
          boxOwner,
          scores: playerScores
        })

        // Check for game completion
        if (isGameComplete(gameState.completedBoxes, gameState.gridSize)) {
          const finalScores = await getFinalScores(lobbyId)
          io.to(lobbyId).emit('gameComplete', { scores: finalScores })
        }

      } catch (error) {
        console.error('Error making move:', error)
        socket.emit('error', { message: 'Failed to make move' })
      }
    })

    socket.on('getGameState', ({ lobbyId }) => {
      const gameState = activeGames.get(lobbyId)
      if (gameState) {
        socket.emit('gameState', {
          ...gameState,
          completedBoxes: Array.from(gameState.completedBoxes.entries())
        })
      } else {
        socket.emit('error', { message: 'Game not found' })
      }
    })

    // Lobby Chat room api's
    socket.on('sendMessage', async ({ lobbyId, userName, message }) => {
      if (!lobbyId || !userName || !message) {
        socket.emit('error', { message: 'Lobby ID, user name and message are required' })
        return
      }
      
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }
        
        if (!lobby.players.includes(userName)) {
          socket.emit('error', { message: 'User not in lobby' })
          return
        }
        
        if (message.trim() === '') {
          socket.emit('error', { message: 'Message cannot be empty' })
          return
        }
        
        await lobby.updateOne({ $push: { messages: { userName: userName, message: message, timestamp: new Date() } } })
        const updatedLobby = await ConnectDotsLobby.findOne({ lobbyId })

        io.to(lobbyId).emit('messages', {lobbyId: lobbyId, messages: updatedLobby.messages })
        console.log(`Message from ${userName} in lobby ${lobbyId}: ${message}`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('getMessages', async ({ lobbyId }) => {
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }
        
        const messages = lobby.messages || []
        socket.emit('messages', { lobbyId: lobbyId, messages: messages })
        console.log(`Messages for lobby ${lobbyId} sent to user ${socket.id}`)
      } catch (error) {
        console.error('Error getting messages:', error)
        socket.emit('error', { message: 'Failed to get messages' })
      }
    })

    // Score Card API's
    socket.on('getScoreCard', async ({ lobbyId }) => {
      try {
        const lobby = await ConnectDotsLobby.findOne({ lobbyId })
        if (!lobby) {
          socket.emit('error', { message: 'Lobby not found' })
          return
        }
        
        const scoreCard = await ScoreCard.findOne({ _id: lobby.scoreCard })
        if (!scoreCard) {
          socket.emit('error', { message: 'Score card not found' })
          return
        }
        
        socket.emit('scoreCardInfo', {
          lobbyId: lobbyId,
          scorecard: scoreCard.players.map(player => ({
            username: player.username,
            score: player.score,
            color: player.color,
            connectedDots: player.connectedDots
          }))
        })
      } catch (error) {
        console.error('Error getting score card:', error)
        socket.emit('error', { message: 'Failed to get score card' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  // Helper functions
  function checkForBoxCompletion(connections, gridSize) {
    const completedBoxes = []
    
    // Check each possible box (square) in the grid
    for (let row = 0; row < gridSize - 1; row++) {
      for (let col = 0; col < gridSize - 1; col++) {
        const topLeft = row * gridSize + col
        const topRight = row * gridSize + col + 1
        const bottomLeft = (row + 1) * gridSize + col
        const bottomRight = (row + 1) * gridSize + col + 1
        
        // Check if all four sides of the box are connected
        const topEdge = connections.some(conn => 
          (conn.from === topLeft && conn.to === topRight) || 
          (conn.from === topRight && conn.to === topLeft)
        )
        
        const bottomEdge = connections.some(conn => 
          (conn.from === bottomLeft && conn.to === bottomRight) || 
          (conn.from === bottomRight && conn.to === bottomLeft)
        )
        
        const leftEdge = connections.some(conn => 
          (conn.from === topLeft && conn.to === bottomLeft) || 
          (conn.from === bottomLeft && conn.to === topLeft)
        )
        
        const rightEdge = connections.some(conn => 
          (conn.from === topRight && conn.to === bottomRight) || 
          (conn.from === bottomRight && conn.to === topRight)
        )
        
        if (topEdge && bottomEdge && leftEdge && rightEdge) {
          completedBoxes.push({
            id: `${row}-${col}`,
            topLeft,
            topRight,
            bottomLeft,
            bottomRight,
            row,
            col
          })
        }
      }
    }
    
    return completedBoxes
  }

  function calculateBoxScores(completedBoxes, players) {
    const scores = {}
    players.forEach(player => scores[player] = 0)
    
    completedBoxes.forEach((boxData, boxId) => {
      if (boxData.owner && scores[boxData.owner] !== undefined) {
        scores[boxData.owner]++
      }
    })
    
    return scores
  }

  function isGameComplete(completedBoxes, gridSize) {
    // Game is complete when all possible boxes are completed
    const totalPossibleBoxes = (gridSize - 1) * (gridSize - 1)
    return completedBoxes.size >= totalPossibleBoxes
  }

  async function getUserColor(lobbyId, userName) {
    try {
      const lobby = await ConnectDotsLobby.findOne({ lobbyId })
      const scoreCard = await ScoreCard.findOne({ _id: lobby.scoreCard })
      const player = scoreCard.players.find(p => p.username === userName)
      return player ? player.color : '#000000'
    } catch (error) {
      return '#000000'
    }
  }

  async function getFinalScores(lobbyId) {
    try {
      const lobby = await ConnectDotsLobby.findOne({ lobbyId })
      const scoreCard = await ScoreCard.findOne({ _id: lobby.scoreCard })
      return scoreCard.players.sort((a, b) => b.score - a.score)
    } catch (error) {
      console.error('Error getting final scores:', error)
      return []
    }
  }
}