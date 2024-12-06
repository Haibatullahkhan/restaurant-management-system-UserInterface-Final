const Order = require('../models/Order');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { customer, items, totalPrice, orderType, paymentMethod, specialRequests } = req.body;
        
        const newOrder = new Order({
            customer,
            items,
            totalPrice,
            orderType,
            paymentMethod,
            specialRequests
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (admin or staff)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('customer').populate('items.menuItem');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus
};
