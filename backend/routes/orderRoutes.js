const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem'); // Ensure MenuItem model is imported correctly
const router = express.Router();
router.get('/incoming', async (req, res) => {
    try {
      const orders = await Order.find({ status: { $in: ['PENDING', 'CONFIRMED'] } })
        .populate('customer', 'username')  // Populate customer with the username
        .populate('assignedStaff', 'username') // Populate assigned staff username
        .populate('items.menuItem')
        .sort({ createdAt: -1 });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No incoming orders found.' });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
      res.status(500).json({ message: 'Error fetching incoming orders', error: error.message });
    }
  });
  

// Update Order Status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
});

// Assign Staff to Order
router.put('/:id/assign', async (req, res) => {
  const { staffId } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { assignedStaff: staffId }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning staff to order', error });
  }
});

// Add a Note to the Order
router.put('/:id/note', async (req, res) => {
  try {
    const { note } = req.body;
    console.log("Received note:", note); // Log the note to ensure it's correct
    if (!note) {
      return res.status(400).json({ message: 'Note cannot be empty' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { specialRequests: note }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note to order', error });
  }
});

// Fetch Order History (Completed and Cancelled Orders)
router.get('/:id/history', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['DELIVERED', 'CANCELLED'] } })
      .populate('customer assignedStaff items.menuItem')
      .sort({ completedAt: -1 });
    
    if (!orders) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error });
  }
});

module.exports = router;
