const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/slot/:slot
// @desc    Get orders by delivery slot
// @access  Admin
router.get('/slot/:slot', async (req, res) => {
    try {
        const slot = req.params.slot.toLowerCase();
        const orders = await Order.find({ deliverySlot: slot }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders by slot:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/status/:status
// @desc    Get orders by status
// @access  Admin
router.get('/status/:status', async (req, res) => {
    try {
        const status = req.params.status.toLowerCase();
        const orders = await Order.find({ status }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { items, deliveryAddress, phone, deliverySlot, paymentMethod, totalAmount } = req.body;
        
        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Please add items to order' });
        }
        
        if (!deliveryAddress || !phone || !deliverySlot || !totalAmount) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        // Calculate delivery charge
        let deliveryCharge = 0;
        if (deliverySlot === 'immediate') {
            deliveryCharge = 30;
        }
        
        // Generate order ID
        const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        
        const order = new Order({
            orderId,
            items,
            deliveryAddress,
            phone,
            deliverySlot: deliverySlot.toLowerCase(),
            paymentMethod: paymentMethod || 'cod',
            totalAmount,
            deliveryCharge,
            status: 'pending'
        });
        
        const savedOrder = await order.save();
        
        // Return order with estimated delivery
        const estimatedDelivery = getEstimatedDelivery(deliverySlot);
        
        res.status(201).json({
            orderId: savedOrder.orderId,
            estimatedDelivery,
            order: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (status) {
            order.status = status.toLowerCase();
        }
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete/Cancel order
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Instead of deleting, mark as cancelled
        order.status = 'cancelled';
        await order.save();
        
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Helper function to get estimated delivery time
function getEstimatedDelivery(slot) {
    const now = new Date();
    let deliveryTime = '';
    
    switch(slot.toLowerCase()) {
        case 'morning':
            deliveryTime = 'Tomorrow 8 AM - 12 PM';
            break;
        case 'afternoon':
            deliveryTime = 'Tomorrow 12 PM - 4 PM';
            break;
        case 'evening':
            deliveryTime = 'Tomorrow 4 PM - 8 PM';
            break;
        case 'immediate':
            deliveryTime = 'Within 2 hours';
            break;
        default:
            deliveryTime = 'Tomorrow';
    }
    
    return deliveryTime;
}

module.exports = router;