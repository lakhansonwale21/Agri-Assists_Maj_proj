const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['expense', 'revenue'], required: true },
    amount: { type: Number, required: true },
    cropOrProduct: { type: String, required: true }, 
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
