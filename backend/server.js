const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const connectDotsRoutes = require('./routes/connectdots/connectDotsRoutes');
const lobbyController = require('./controllers/connectdots/lobbyController');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

connectDB();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// 💡 Log requests
app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.originalUrl);
  next();
});

// ✅ Register REST API routes first
app.use('/api/users', authRoutes);

// ✅ Dynamic route last
app.use('/:userId/connectDots', connectDotsRoutes);

// 🔌 Socket.IO setup
const server = http.createServer(app);
const io = new require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

lobbyController(io); // socket handlers

// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Export the server for testing purposes
module.exports = server;
