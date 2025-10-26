const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        index: true
    },
    type: {
        type: String,
        enum: ['fruits', 'vegetables'],
        required: [true, 'Please provide category'],
        lowercase: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: 0
    },
    unit: {
        type: String,
        required: [true, 'Please provide unit'],
        default: 'per kg'
    },
    image: {
        type: String,
        required: [true, 'Please provide image URL']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: null // null means unlimited / not tracked
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);