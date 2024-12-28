const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Broadcast message to all connected clients
function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// API endpoint for receiving messages from Make.com
app.post('/api/message', (req, res) => {
    const { message, type, user } = req.body;
    
    // Broadcast the message to all connected clients
    broadcast({
        type: 'message',
        messageType: type || 'host',
        user: user || 'Selina (Host)',
        text: message
    });

    res.json({ success: true });
});

// Simple test endpoint
app.get('/', (req, res) => {
    res.send('Chat server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
