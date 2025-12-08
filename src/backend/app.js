const express = require('express');
const connectDB = require('./database');;
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // parse JSON

// Test route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Import routes
// app.use

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));