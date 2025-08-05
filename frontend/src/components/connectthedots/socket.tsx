// src/socket.ts
import { io, Socket } from 'socket.io-client'

const URL = 'http://localhost:5000' // or env var

export const socket: Socket = io(URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
})

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason)
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error)
})
