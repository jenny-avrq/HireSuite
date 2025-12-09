const express = require('express');
const connectDB = require('./database');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
})); // Allow frontend requests
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
    secret: 'GuardiansOfTheData',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Test route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Import routes
const authRoutes = require('../routes/authentication');

// Use routes with the base path
app.use('/auth', authRoutes);

// Wrap Express app in HTTP server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
    console.log('Websocket connected!');

    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected.');
    });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));