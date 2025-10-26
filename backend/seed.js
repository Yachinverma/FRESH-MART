const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGO = process.env.MONGODB_URI;

const products = [
  { 
    name: 'Fresh Red Apple',
    type: 'fruits',
    price: 80,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
  },
  { 
    name: 'Organic Bananas',
    type: 'fruits',
    price: 40,
    unit: '6 pieces',
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224'
  },
  { 
    name: 'Alphonso Mango',
    type: 'fruits',
    price: 150,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed'
  },
  { 
    name: 'Fresh Tomatoes',
    type: 'vegetables',
    price: 30,
    unit: '500 g',
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337'
  },
  { 
    name: 'Farm Potatoes',
    type: 'vegetables',
    price: 25,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1635774855536-9728f2610245'
  },
  { 
    name: 'Fresh Spinach',
    type: 'vegetables',
    price: 20,
    unit: '250 g',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb'
  }
];

async function uploadToCloudinary(imageUrl, productName) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'FRESH_MART/products',
      public_id: productName.toLowerCase().replace(/\s+/g, '-'),
      overwrite: true,
      transformation: [
        { width: 400, height: 300, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    console.log(`Uploaded ${productName} image`);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${productName} image:`, error);
    return null;
  }
}

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log('Connected to MongoDB Atlas');

    const Product = require('./models/Product');

    for (let product of products) {
      const cloudinaryUrl = await uploadToCloudinary(product.imageUrl, product.name);
      if (cloudinaryUrl) {
        product.image = cloudinaryUrl;
        delete product.imageUrl;
        
        await Product.findOneAndUpdate(
          { name: product.name },
          product,
          { upsert: true, new: true }
        );
        console.log(`Added/Updated ${product.name}`);
      }
    }

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
