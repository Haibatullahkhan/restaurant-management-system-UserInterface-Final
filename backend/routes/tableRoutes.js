const express = require('express');
const Table = require('../models/Table'); // Assuming the Table model is located here
const User = require('../models/User'); // Assuming the User model is located here
const Order = require('../models/Order'); // Assuming the Order model is located here
const router = express.Router();

// Get all tables with details
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find().populate('reservedBy', 'username'); // Populate the reservedBy field with the user's username
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error });
    }
});

// Get all customers with their orderId
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.find({ role: 'CUSTOMER' }); // Assuming 'CUSTOMER' role represents customers
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
});

// Update table status and reservation details
router.put('/:id/status', async (req, res) => {
    const { status, reservedBy, reservationTime } = req.body;

    try {
        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { status, reservedBy, reservationTime: reservationTime || null },
            { new: true }
        ).populate('reservedBy', 'username');

        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error updating table status', error });
    }
});

// Reserve a table
router.post('/reserve', async (req, res) => {
    const { tableNumber, reservedBy, reservationTime } = req.body;

    try {
        const table = await Table.findOneAndUpdate(
            { tableNumber, status: 'AVAILABLE' }, // Only reserve available tables
            { status: 'RESERVED', reservedBy, reservationTime },
            { new: true }
        ).populate('reservedBy', 'username');

        if (!table) return res.status(404).json({ message: 'Table not found or unavailable' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error reserving table', error });
    }
});

// Assign order to a table
router.put('/:id/assign', async (req, res) => {
    const { orderId } = req.body; // Get orderId from the request body

    try {
        // Find the order by orderId
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Assign the order to the table
        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { reservedBy: order.customer }, // Assuming order has a 'customer' field that is a reference to the User model
            { new: true }
        ).populate('reservedBy', 'username');

        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning order to table', error });
    }
});

module.exports = router;
