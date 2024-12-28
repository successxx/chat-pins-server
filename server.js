// server.js
const express = require('express');
const app = express();
app.use(express.json());

// We'll store pinned messages in memory
// (If Heroku restarts, they'll vanish, but that's usually OK for a live webinar.)
let pinnedMessages = [];

// Endpoint to receive new pinned messages from Make.com
app.post('/api/messages', (req, res) => {
  const { text, user, timestamp } = req.body;
  
  // We'll push this message into memory
  pinnedMessages.push({
    text,
    user,
    timestamp,
    id: Date.now() // unique ID
  });

  return res.status(200).json({ success: true });
});

// Endpoint to get all pinned messages
app.get('/api/messages', (req, res) => {
  // For simplicity, return them all
  // (You can filter out old ones or time-based ones if you like)
  res.json(pinnedMessages);
});

const PORT = process.env.PORT || 3000;
// Root endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('Server is running. Ready to receive messages!');
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
