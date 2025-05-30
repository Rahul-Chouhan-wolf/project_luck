// server.js 
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const connectDotsRoutes = require('./routes/connectdots/connectDotsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors')
dotenv.config();
const { Server } = require('socket.io');
const http = require('http');
connectDB();
const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // frontend origin
    methods: ['GET', 'POST'],
  },
});

app.use('/:userId/connectDots', connectDotsRoutes);

app.use('/api/users', authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));