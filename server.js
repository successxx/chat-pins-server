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

async function getClaudeResponse(userMessage) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: You are Selina, hosting a live webinar about PrognosticAI. Be enthusiastic, knowledgeable, and engaging. Keep responses concise and natural. Someone asked: ${userMessage}
                }],
                model: 'claude-3-sonnet-20240229',
                max_tokens: 150
            })
        });

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('Claude API error:', error);
        return 'I apologize, but I\'m having trouble connecting to our AI system. Could you please repeat your question?';
    }
}

app.post('/api/message', async (req, res) => {
    const { message, type, user } = req.body;
    
    if (type === 'user') {
        const aiResponse = await getClaudeResponse(message);
        broadcast({
            type: 'message',
            messageType: 'host',
            user: 'Selina (Host)',
            text: aiResponse
        });
    } else {
        broadcast({
            type: 'message',
            messageType: type || 'host',
            user: user || 'Selina (Host)',
            text: message
        });
    }
    
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send('Chat server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(Server running on port ${PORT});
});
