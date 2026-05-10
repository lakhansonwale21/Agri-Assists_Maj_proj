const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'shopkeeper', 'admin'], required: true },
    city: { type: String, required: true },
    state: { type: String }, // For Farmers
    farmSize: { type: String }, // For Farmers
    mainCrop: { type: String }, // For Farmers
    shopName: { type: String }, // For Shopkeepers
    shopAddress: { type: String }, // For Shopkeepers
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
