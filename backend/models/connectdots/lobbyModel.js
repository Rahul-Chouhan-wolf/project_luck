const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const ConnectDotsLobbySchema = new mongoose.Schema({
  lobbyId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    type: String,
    required: true
  }],
  messages: [MessageSchema],
  scoreCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScoreCard',
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const ConnectDotsLobby = mongoose.model('ConnectDotsLobby', ConnectDotsLobbySchema)
module.exports = ConnectDotsLobby