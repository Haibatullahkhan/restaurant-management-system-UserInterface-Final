const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem'); // Ensure MenuItem model is imported correctly

const router = express.Router();

// Fetch Incoming Orders (status: PENDING, CONFIRMED)
router.get('/incoming', async (req, res) => {
  try {
    // The MongoDB query to find orders with status 'PENDING' or 'CONFIRMED'
    const orders = await Order.find({ status: { $in: ['PENDING', 'CONFIRMED'] } })
      .populate('customer assignedStaff items.menuItem')  // Populate customer, assignedStaff, and menuItem fields
      .sort({ createdAt: -1 });  // Sort orders by creation date, latest first
    
    // If no orders are found, return an appropriate response
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No incoming orders found.' });
    }

    // Return the fetched orders as a response
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching incoming orders:", error);  // Log detailed error
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

const addNote = (orderId, note) => {
    axios.put(`http://localhost:5000/api/orders/${orderId}/note`, { note })
      .then(response => {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, specialRequests: note } : order
        ));
        // Close the modal or do other actions if needed
        alert("Note added successfully!");
      })
      .catch(error => {
        console.error("Error adding note:", error);
        alert("Failed to add note");
      });
  };
  
  

// Fetch Order History (Completed and Cancelled Orders)
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
