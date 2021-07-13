const express = require('express')
const socket = require('socket.io')

// App setup
const PORT = 3000
const app = express()
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
  console.log(`http://localhost:${PORT}`)
})

// Static files
app.use(express.static('public'))

// Socket setup
const io = socket(server)

const activeUsers = new Set()
// sever socket 連線狀態
io.on('connection', (socket) => {
  // socket 聊天室已連線
  console.log('Made socket connection')
  // 聊天室有新使用者進入
  socket.on('new user', (data) => {
    // 取得該使用者資料
    socket.userId = data
    // 線上使用者列表加入該名使用者
    activeUsers.add(data)
    // 聊天室通知新使用者上線
    io.emit('new user', [...activeUsers])
  })
  // 偵測到有使用者送出訊息
  socket.on('chat message', (data) => {
    // 把訊息傳送到聊天室
    io.emit('chat message', data)
  })

  // 偵測離線狀態
  socket.on('disconnect', () => {
    // 線上使用者列表移除離線使用者資料
    activeUsers.delete(socket.userId)
    // 聊天室通知該名使用者離開聊天
    io.emit('user disconnected', socket.userId)
  })
  // 偵測到有使用者正在打字
  socket.on('typing', (data) => {
    // 向聊天傳送某使用者正在打字的訊息
    socket.broadcast.emit('typing', data)
  })
})
