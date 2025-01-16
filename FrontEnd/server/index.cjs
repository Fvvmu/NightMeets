const { createServer } = require('http');
const { Server } = require('socket.io');

// Tworzenie serwera HTTP i Socket.IO
const server = createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Użytkownik połączony z Socket.IO');

// Obsługa wiadomości z czatu
  socket.on('chat message', (msg) => {
    console.log(`Wiadomość od ${msg.username}: ${msg.message}`);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Użytkownik rozłączony z Socket.IO');
  });
});

// Nasłuchiwanie na porcie 3001
server.listen(3001, () => {
  console.log('Socket.IO serwer uruchomiony na http://localhost:3001/');
});