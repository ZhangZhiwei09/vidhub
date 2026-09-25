import { Server } from 'socket.io'

const port = Number(process.env.PORT ?? 5000)
const corsOrigin = process.env.CORS_ORIGIN ?? '*'

const io = new Server(port, {
  serveClient: false,
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
})

/** userId -> socketId */
const onlineSockets = new Map<number, string>()

io.on('connection', (socket) => {
  socket.on('join', (id: number) => {
    onlineSockets.set(id, socket.id)
  })

  socket.on('joinRoom', (roomId: string | number) => {
    socket.join(String(roomId))
  })

  socket.on('leaveRoom', (roomId: string | number) => {
    socket.leave(String(roomId))
  })

  socket.on('sendDanmaku', (data: { roomId: string | number }) => {
    io.to(String(data.roomId)).emit('msg', { type: 'danmaku', data })
  })

  socket.on('sendMessage', (data: { to_id: number }) => {
    const target = onlineSockets.get(data.to_id)
    if (target) {
      io.to(target).emit('msg', { type: 'private', data })
    }
  })

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineSockets.entries()) {
      if (sid === socket.id) {
        onlineSockets.delete(uid)
        break
      }
    }
  })
})

console.log(`[realtime] listening on :${port}`)