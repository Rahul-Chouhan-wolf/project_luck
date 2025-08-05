const mongoose = require('mongoose');

const playerScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  color: { type: String, required: true },
  connectedDots: { type: Number, default: 0 }
});

const scoreCardSchema = new mongoose.Schema({
  lobby: { type: mongoose.Schema.Types.ObjectId, ref: 'ConnectDotsLobby', required: true },
  players: [playerScoreSchema]
}, { timestamps: true });

const sortByScore = (a, b) => b.score - a.score;
scoreCardSchema.methods.getSortedPlayers = function() {
  return this.players.sort(sortByScore);
};

module.exports = mongoose.model('ScoreCard', scoreCardSchema);