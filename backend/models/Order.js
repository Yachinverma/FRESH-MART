const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    items: [orderItemSchema],
    deliveryAddress: {
        type: String,
        required: [true, 'Please provide delivery address']
    },
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
    paymentMethod: {
        type: String,
        default: 'cod'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryCharge: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate unique order ID before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        this.orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);