const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders  -> create new order
router.post('/', async (req, res) => {
	try {
		const payload = req.body;
		// basic validation
		if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
			return res.status(400).json({ error: 'Cart items required' });
		}
		const order = await Order.createFromPayload(payload);
		await order.save();
		return res.status(201).json({ orderId: order.orderId, id: order._id, totalAmount: order.totalAmount });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message || 'Server error' });
	}
});

// GET /api/orders -> list (with optional query filters)
router.get('/', async (req, res) => {
	try {
		const filter = {};
		if (req.query.status) filter.status = req.query.status;
		if (req.query.slot) filter.deliverySlot = req.query.slot;
		const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
		return res.json(orders);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
	try {
		const order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: req.params.id }] }).lean();
		if (!order) return res.status(404).json({ error: 'Order not found' });
		return res.json(order);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
});

// PUT /api/orders/:id/status  -> change status
router.put('/:id/status', async (req, res) => {
	try {
		const { status, note } = req.body;
		if (!status) return res.status(400).json({ error: 'Status required' });
		const order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: req.params.id }] });
		if (!order) return res.status(404).json({ error: 'Order not found' });
		order.status = status;
		order.statusHistory.push({ status, note, at: new Date() });
		await order.save();
		return res.json({ success: true, orderId: order.orderId, status: order.status });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
});

module.exports = router;