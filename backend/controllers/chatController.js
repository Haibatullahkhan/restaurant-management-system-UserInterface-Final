const express = require('express');
const router = express.Router();

// Simulating a database for chat messages (in-memory store)
let chatMessages = [];

// Route to get chat history
router.get('/api/chat', (req, res) => {
  // Send back the chat messages
  res.json(chatMessages);
});

// Route to send a new message
router.post('/api/chat', (req, res) => {
  const { sender, message, role } = req.body;
  
  // Check if all required fields are present
  if (!sender || !message || !role) {
    return res.status(400).json({ error: 'Sender, message, and role are required' });
  }

  // Create a new message object
  const newMessage = {
    sender,
    message,
    role,
    timestamp: new Date().toISOString(),  // Timestamp of when the message was sent
  };

  // Save message to the in-memory store (simulating database)
  chatMessages.push(newMessage);

  // Send the new message back as a response
  res.json({ newMessage });
});

module.exports = router;
