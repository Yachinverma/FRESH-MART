const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['fruits', 'vegetables'],
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);