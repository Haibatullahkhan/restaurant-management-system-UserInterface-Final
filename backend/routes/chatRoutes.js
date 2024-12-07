const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to your messages file
const messagesFilePath = path.join(__dirname, '../messages.json');

// Function to read messages from the JSON file
const readMessagesFromFile = () => {
  const data = fs.readFileSync(messagesFilePath, 'utf8');
  return JSON.parse(data);
};

// Function to write messages to the JSON file
const writeMessagesToFile = (messages) => {
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
};

// Route to get all chat messages
router.get('/', (req, res) => {
  try {
    const messages = readMessagesFromFile(); // Read messages from file
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Route to post a new chat message
router.post('/', (req, res) => {
  const { sender, message, role } = req.body;

  if (!sender || !message || !role) {
    return res.status(400).json({ error: 'Sender, message, and role are required' });
  }

  try {
    const messages = readMessagesFromFile(); // Read existing messages
    const newMessage = {
      sender,
      message,
      role,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage); // Add the new message to the array
    writeMessagesToFile(messages); // Write updated messages back to file

    res.json({ newMessage }); // Return the newly added message
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ message: 'Failed to save chat message' });
  }
});

module.exports = router;
