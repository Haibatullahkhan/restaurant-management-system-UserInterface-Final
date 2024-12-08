const express = require('express');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem'); // Ensure MenuItem model is imported correctly
const router = express.Router();

// Helper function to log order history to a JSON file
const logOrderHistory = (orderId, action) => {
  const filePath = path.join(__dirname, '../data', 'orderHistory.json');

  // Find the order details to get the current status, price, and customer
  Order.findById(orderId)
    .populate('customer', 'username')
    .then(order => {
      if (!order) return;

      const orderHistory = {
        orderId: order._id,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: action,
            price: order.totalPrice,
            status: order.status,
            username: order.customer.username,
          }
        ]
      };

      // Read existing history from the JSON file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading order history file:', err);
        } else {
          const historyData = data ? JSON.parse(data) : [];
          // Check if history for the order already exists
          const existingOrderHistory = historyData.find(h => h.orderId.toString() === orderId.toString());
          
          if (existingOrderHistory) {
            // If history exists, push the new action to history
            existingOrderHistory.history.push(orderHistory.history[0]);
          } else {
            // If no history exists for this order, add a new entry
            historyData.push(orderHistory);
          }

          // Write updated history back to the JSON file
          fs.writeFile(filePath, JSON.stringify(historyData, null, 2), 'utf8', (err) => {
            if (err) {
              console.error('Error writing to order history file:', err);
            }
          });
        }
      });
    })
    .catch(err => console.error('Error fetching order details:', err));
};

// Get incoming orders (PENDING or CONFIRMED status)
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

// Update Order Status (For example: preparing, completed, etc.)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Log the status change to the order history file
    logOrderHistory(order._id, `Status updated to ${status}`);

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

// Add a Note to the Order (Special Requests)
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
router.get('/incoming', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['DELIVERED', 'CANCELLED'] } })
      .populate('customer assignedStaff items.menuItem')
      .sort({ completedAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No order history found' });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error });
  }
});

module.exports = router;
