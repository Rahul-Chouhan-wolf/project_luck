import { useEffect, useState, useRef } from 'react'

interface ChatroomProps {
  userName: string
  lobbyId: string
  socket: any
}

type Message = {
  userName: string
  message: string
}

const Chatroom: React.FC<ChatroomProps> = ({ userName, lobbyId, socket }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Request all messages when joining/changing lobby
    socket.emit('getMessages', { lobbyId })

    const handleMessages = (data: { messages: Message[] }) => {
      setMessages(data.messages || [])
    }

    socket.on('messages', handleMessages)

    return () => {
      socket.off('messages', handleMessages)
    }
  }, [lobbyId, socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      socket.emit('sendMessage', { lobbyId, userName, message: input })
      setInput('')
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div
      style={{
        width: 300,
        background: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <h3>Chat Room</h3>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b
              style={{
                color: msg.userName === userName ? '#1976d2' : undefined,
              }}
            >
              {msg.userName}:
            </b>{' '}
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
          }}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chatroom
