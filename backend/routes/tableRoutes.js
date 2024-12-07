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

// Get a single orderId
router.get('/orderId', async (req, res) => {
    try {
        // Find a single order and return its ID
        const order = await Order.findOne({}, '_id'); // Get the first order's ID
        if (!order) return res.status(404).json({ message: 'No orders found' });
        res.status(200).json(order); // Send back the order ID
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order ID', error });
    }
});

// Update table status and reservation details
router.put('/:id/status', async (req, res) => {
    const { status } = req.body; // Only status is passed when setting available

    try {
        let updateFields = { status }; // Only update the status

        if (status === 'AVAILABLE') {
            updateFields.reservedBy = null; // Clear the reservedBy field if the table is set to AVAILABLE
            updateFields.reservationTime = null; // Optionally clear the reservation time as well
        }

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).populate('reservedBy', 'username');

        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error updating table status', error });
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
