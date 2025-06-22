const ConnectDotsLobby = require("../../models/connectdots/lobbyModel")
const ScoreCard = require("../../models/connectdots/scoreCard")
const ConnectDotsUser = require("../../models/connectdots/userModel")

module.exports = (io) => {
  io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id)

  socket.on('createLobby', async ({ userId }) => {
    if (!userId) {
      socket.emit('error', { message: 'User ID is required' })
      return
    }
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

    const lobbyScoreCard = ScoreCard.create({
      lobby,
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
    console.log('scorecard created:', lobbyScoreCard)
    // Associate the score card with the lobby
    lobby['scoreCard'] = await lobbyScoreCard
    await lobby.save()

    if (!lobby) {
      socket.emit('error', { message: 'Failed to create lobby' })
      return
    }
    socket.emit('lobbyCreated', { lobbyId })
    socket.join(lobbyId) // <-- Add this line
    console.log(`Lobby ${lobbyId} created by user ${user.userName}`)
  })

  socket.on('getLobbyInfo', async ({ lobbyId, userId }) => {
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
  })

  socket.on('joinLobby', async ({ lobbyId, userName }) => {
    if (userName === undefined || userName === null || userName.trim() === '') {
      socket.emit('error', { message: 'username can not be empty' })
      return
    }
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
    const userColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    await ScoreCard.updateOne(
      { lobby: lobby._id },
      { $push: { players: { username: userName, score: 0, color: userColor, connectedDots: 0 } } }
    )
    socket.join(lobbyId)

    io.to(lobbyId).emit('lobbyJoined', {
      lobbyId,
      players: updatedLobby.players,
    })

    io.to(lobbyId).emit('lobbyUpdate', {
      lobbyId,
      players: updatedLobby.players,
    })
    
    console.log(`User ${userName} joined lobby ${lobbyId}`)
  })

  socket.on('leaveLobby', async ({ lobbyId, userName }) => {
    console.log(`User ${userName} is leaving lobby ${lobbyId}`)
    if (!lobbyId || !userName) {
      socket.emit('error', { message: 'Lobby ID and user name are required' })
      return
    }
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

    socket.emit('leftLobby', { lobbyId, userName })
    io.to(lobbyId).emit('lobbyUpdate', {
      lobbyId,
      players: updatedLobby.players,
    }   )
    socket.leave(lobbyId) // Remove the user from the lobby room

    console.log(`User ${userName} left lobby ${lobbyId}`)
  })


  // Lobby Chat room api's
  socket.on('sendMessage', async ({ lobbyId, userName, message }) => {
    if (!lobbyId || !userName || !message) {
      socket.emit('error', { message: 'Lobby ID, user name and message are required' })
      return
    }
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
    // Assuming you have a messages field in your lobby model
    await lobby.updateOne({ $push: { messages: { userName: userName, message: message, timestamp: new Date() } } })
    const updatedLobby = await ConnectDotsLobby.findOne({ lobbyId })
    // Emit the new message to all users in the lobby

    io.to(lobbyId).emit('messages', {lobbyId: lobbyId, messages: updatedLobby.messages })
    console.log(`Message from ${userName} in lobby ${lobbyId}: ${message}`)
  })

  socket.on('getMessages', async ({ lobbyId }) => {
    const lobby = await ConnectDotsLobby.findOne({ lobbyId })
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' })
      return
    }
    // Assuming you have a messages field in your lobby model
    const messages = lobby.messages || []
    socket.emit('messages', { lobbyId: lobbyId, messages: messages })
    console.log(`Messages for lobby ${lobbyId} sent to user ${socket.id}`)
  })


  // Score Card API's
  socket.on('getScoreCard', async ({ lobbyId }) => {
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
  })

  socket.on('updateScore', async ({ lobbyId, userName, score, color, connectedDots }) => {
    if (!lobbyId || !userName || score === undefined || color === undefined || connectedDots === undefined) {
      socket.emit('error', { message: 'Lobby ID, user name, score, color and connected dots are required' })
      return
    }
    const lobby = await ConnectDotsLobby.findOne({ lobbyId })
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' })
      return
    }
    if (!lobby.players.includes(userName)) {
      socket.emit('error', { message: 'User not in lobby' })
      return
    }
    // Update the player's score in the lobby
    await ConnectDotsLobby.updateOne(
      { lobbyId, 'players.userName': userName },
      { $set: { 'players.$.score': score, 'players.$.color': color, 'players.$.connectedDots': connectedDots } }
    )
    const updatedLobby = await ConnectDotsLobby.findOne({ lobbyId }).populate('players')
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
    // You can clean up player from lobby here if needed
  })
  })
}