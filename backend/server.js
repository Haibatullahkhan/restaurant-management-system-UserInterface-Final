const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})); // Enable CORS for frontend-backend communication

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import Routes
const orderRoutes = require('./routes/orderRoutes'); // Routes for orders
const tableRoutes = require('./routes/tableRoutes'); // Routes for tables

// Use Routes
app.use('/api/orders', orderRoutes); // Use the order routes
app.use('/api/tables', tableRoutes); // Use the table routes

// Sample Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Logs the full error stack
  res.status(500).send({ message: 'Something went wrong on the server!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
