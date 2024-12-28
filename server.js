const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Add the /ask endpoint
app.post('/ask', async (req, res) => {
    try {
        const { message, apiKey } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Send response back
        broadcast({
            type: 'message',
            messageType: 'host',
            user: 'Selina (Host)',
            text: message
        });

        res.json({ success: true, response: message });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Message broadcast endpoint
app.post('/api/message', (req, res) => {
    const { message, type, user } = req.body;
    broadcast({
        type: 'message',
        messageType: type || 'host',
        user: user || 'Selina (Host)',
        text: message
    });
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send('Chat server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
