const express = require('express');
  // Correct import
const router = express.Router();

const Order = require('../models/Order');

// Sample route to check if orders are being retrieved correctly
router.get('/test', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error: error.message });
    }
});


// Get all incoming orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ status: 'PENDING' })  // Use the 'PENDING' status for incoming orders
            .populate('customer')  // Populate customer info
            .populate('items.menuItem')  // Populate menu items in the order
            .populate('assignedStaff');  // Populate assigned staff info

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error: error.message });
    }
});

module.exports = router;
