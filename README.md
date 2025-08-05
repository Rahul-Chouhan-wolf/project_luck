# Connect the Dots - Multiplayer Game

A real-time multiplayer Connect the Dots game built with React, Node.js, Express, Socket.IO, and MongoDB.

## Features

- **Real-time Multiplayer**: Play with friends in real-time using Socket.IO
- **Turn-based Gameplay**: Players take turns connecting dots
- **Live Chat**: Communicate with other players in the lobby
- **Score Tracking**: Real-time score updates and final results
- **Lobby System**: Create and join game lobbies
- **User Management**: Create and update usernames
- **Responsive Design**: Modern UI built with Material-UI

## Game Rules

1. Players take turns connecting dots on a 10x10 grid
2. Only horizontal and vertical connections are allowed
3. Each connection earns the player 10 points
4. The game ends when all possible connections are made
5. The player with the most points wins

## Tech Stack

### Frontend
- React 19.1.0
- TypeScript
- Material-UI (MUI)
- Socket.IO Client
- React Router DOM

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT for authentication

## Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local instance running on port 27017)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## How to Play

1. **Create Username**: Enter a username when you first visit the game
2. **Create or Join Lobby**: 
   - Click "Create Lobby" to start a new game
   - Click "Join Lobby" to enter an existing lobby ID
3. **Wait for Players**: The game starts when multiple players join
4. **Take Turns**: Players take turns connecting dots
5. **Score Points**: Each connection earns 10 points
6. **Win**: The player with the most points when all connections are made wins

## API Endpoints

### REST API
- `POST /:userId/connectDots/createUserName` - Create username
- `GET /:userId/connectDots/getUserName` - Get username
- `PUT /:userId/connectDots/updateUserName` - Update username

### Socket.IO Events

#### Client to Server
- `createLobby` - Create a new game lobby
- `joinLobby` - Join an existing lobby
- `leaveLobby` - Leave the current lobby
- `getLobbyInfo` - Get lobby information
- `getGameState` - Get current game state
- `makeMove` - Make a move (connect dots)
- `sendMessage` - Send chat message
- `getMessages` - Get chat messages
- `getScoreCard` - Get score information

#### Server to Client
- `lobbyCreated` - Lobby created successfully
- `lobbyJoined` - Successfully joined lobby
- `lobbyUpdate` - Lobby state updated
- `gameState` - Current game state
- `moveMade` - Move was made by a player
- `gameComplete` - Game finished
- `messages` - Chat messages
- `scoreCardInfo` - Score information
- `error` - Error message

## Recent Fixes and Improvements

### Socket.IO Issues Fixed
- ✅ Fixed multiple event listener memory leaks
- ✅ Improved connection handling with proper cleanup
- ✅ Added proper error handling and reconnection logic
- ✅ Fixed turn management for multiple users

### Game Logic Improvements
- ✅ Added real-time game state synchronization
- ✅ Implemented proper turn-based gameplay
- ✅ Added score calculation and tracking
- ✅ Created game completion detection
- ✅ Added visual feedback for current turn

### Backend Improvements
- ✅ Fixed MongoDB update operations
- ✅ Added proper error handling
- ✅ Improved data validation
- ✅ Fixed score card model constraints
- ✅ Simplified setup with hardcoded values

### Frontend Improvements
- ✅ Added disabled state for dots when not user's turn
- ✅ Improved error handling and user feedback
- ✅ Added game completion dialog
- ✅ Enhanced score display with connection counts
- ✅ Better socket event management

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running on your machine
- Default connection: `mongodb://localhost:27017/connect_dots`
- If using a different MongoDB setup, update the connection string in `backend/config/db.js`

### Port Issues
- Backend runs on port 5000
- Frontend runs on port 3000
- Make sure these ports are available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please open an issue on the repository. 