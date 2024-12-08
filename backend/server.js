const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes); // Add auth routes to handle login and user authentication

// Sample Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Route to get order history
app.get('/api/orders/:orderId/history', (req, res) => {
  const { orderId } = req.params;
  const filePath = path.join(__dirname, 'data', 'orderHistory.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading order history file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const historyData = JSON.parse(data);
    const orderHistory = historyData.find(order => order.orderId === orderId);

    if (!orderHistory) {
      return res.status(404).json({ message: 'Order history not found' });
    }

    res.json(orderHistory.history);
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong on the server!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
