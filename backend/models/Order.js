const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
	// link to product if available
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: false
	},
	name: { type: String, required: true },
	quantity: { type: Number, required: true, min: 1 },
	price: { type: Number, required: true, min: 0 },
	unit: { type: String, required: false } // e.g. "1 kg", "1 dozen"
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
	status: {
		type: String,
		enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
		required: true
	},
	at: { type: Date, default: Date.now },
	note: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
	orderId: { type: String, required: true, unique: true, index: true },
	customerName: { type: String },
	items: { type: [orderItemSchema], default: [] },
	deliveryAddress: { type: String, required: [true, 'Please provide delivery address'] },
	phone: {
		type: String,
		required: [true, 'Please provide phone number'],
		match: [/^[0-9]{10}$/, 'Please provide valid 10-digit phone number']
	},
	deliverySlot: {
		type: String,
		required: true,
		enum: ['morning', 'afternoon', 'evening', 'immediate']
	},
	status: {
		type: String,
		enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
		default: 'pending'
	},
	statusHistory: { type: [statusHistorySchema], default: [] },
	paymentMethod: { type: String, default: 'cod' },
	totalAmount: { type: Number, required: true, min: 0 },
	deliveryCharge: { type: Number, default: 0 }
}, {
	timestamps: true
});

// helper for orderId
function generateOrderId() {
	return 'ORD' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

// Generate unique order ID and compute total before saving
orderSchema.pre('validate', function(next) {
	// set orderId if missing
	if (!this.orderId) this.orderId = generateOrderId();

	// ensure statusHistory has initial record
	if (!this.statusHistory || this.statusHistory.length === 0) {
		this.statusHistory = [{ status: this.status || 'pending', at: new Date() }];
	}

	// compute totalAmount from items (server-side authoritative)
	const itemsTotal = (this.items || []).reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
	this.totalAmount = Number((itemsTotal + (this.deliveryCharge || 0)).toFixed(2));
	next();
});

// Instance method to add item (accumulate quantity)
orderSchema.methods.addItem = function(item) {
	// item: { productId, name, price, quantity, unit }
	const existing = this.items.find(i => {
		// prefer matching productId, fallback to name+unit
		if (i.productId && item.productId) return i.productId.toString() === item.productId.toString();
		return i.name === item.name && (i.unit || '') === (item.unit || '');
	});
	if (existing) {
		existing.quantity += item.quantity;
	} else {
		this.items.push({
			productId: item.productId,
			name: item.name,
			price: item.price,
			quantity: item.quantity,
			unit: item.unit
		});
	}
	// update totalAmount immediately
	const itemsTotal = (this.items || []).reduce((sum, it) => sum + it.price * it.quantity, 0);
	this.totalAmount = Number((itemsTotal + (this.deliveryCharge || 0)).toFixed(2));
	return this;
};

// static helper to create order from plain object (useful in controllers)
orderSchema.statics.createFromPayload = async function(payload) {
	// payload should include items array and delivery info
	const Order = this;
	const o = new Order({
		customerName: payload.customerName,
		items: payload.items || [],
		deliveryAddress: payload.deliveryAddress,
		phone: payload.phone,
		deliverySlot: payload.deliverySlot,
		paymentMethod: payload.paymentMethod || 'cod',
		deliveryCharge: payload.deliveryCharge || 0
	});
	await o.validate();
	return o;
};

module.exports = mongoose.model('Order', orderSchema);