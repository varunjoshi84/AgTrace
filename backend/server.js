const http = require('http');               // core module
const app = require('./app');               // express app
const connectDB = require('./config/db');
const { Server } = require('socket.io');

connectDB();

const server = http.createServer(app);      
const io = new Server(server, {
  cors: { 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], 
    credentials: true 
  }
});

// Attach io to app for routes to emit
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});
