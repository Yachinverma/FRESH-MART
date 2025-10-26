require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// static file serving for frontend (optional)
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// connect to MongoDB
const MONGO = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freshmart';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.error('MongoDB connection error:', err));

// routes
const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// basic health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
