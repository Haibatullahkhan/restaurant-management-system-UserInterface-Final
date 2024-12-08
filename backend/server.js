const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');  // Import table routes
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const sportsRoutes = require('./routes/sportsRoutes');
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
app.use('/api/tables', tableRoutes);  // Use the table routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
// Sample Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
