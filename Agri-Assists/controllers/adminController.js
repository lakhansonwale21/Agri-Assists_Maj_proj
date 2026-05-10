const User = require('../models/User');
const Settings = require('../models/Settings');
const ContactMessage = require('../models/ContactMessage');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching users' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // prevent editing critical hidden fields
        delete updateData.password;
        delete updateData._id;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating user' });
    }
};

const getStats = async (req, res) => {
    try {
        const farmersCount = await User.countDocuments({ role: 'farmer' });
        const shopkeepersCount = await User.countDocuments({ role: 'shopkeeper' });
        res.json({ success: true, stats: { farmers: farmersCount, shopkeepers: shopkeepersCount } });
    } catch (error) {
        console.error('Fetch Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching stats' });
    }
};

const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Fetch Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const updateData = req.body;
        // Don't allow updating _id
        delete updateData._id;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(updateData);
        } else {
            settings = await Settings.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
        }
        
        res.json({ success: true, message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating settings' });
    }
};

const getPublicSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne().select('siteName contactEmail contactPhone address aboutUs');
        res.json({ success: true, settings: settings || {} });
    } catch (error) {
        console.error('Fetch Public Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Fetch Messages Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching messages' });
    }
};

const deleteAdminMessage = async (req, res) => {
    try {
        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete Message Error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting message' });
    }
};

module.exports = { getAllUsers, deleteUser, updateUser, getStats, getSettings, updateSettings, getPublicSettings, getMessages, deleteAdminMessage };
