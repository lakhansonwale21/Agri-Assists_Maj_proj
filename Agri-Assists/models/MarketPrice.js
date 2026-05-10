const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    crop: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
