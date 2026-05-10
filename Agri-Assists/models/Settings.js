const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Agri-Assists'
    },
    contactEmail: {
        type: String,
        default: 'admin@agri-assists.com'
    },
    contactPhone: {
        type: String,
        default: '+1234567890'
    },
    address: {
        type: String,
        default: '123 Smart Agri St, Farmville'
    },
    aboutUs: {
        type: String,
        default: 'Empowering farmers and shopkeepers.'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    allowRegistrations: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
