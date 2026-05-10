const ContactMessage = require('../models/ContactMessage');

const submitContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        await ContactMessage.create({ name, email, subject, message });
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact Submit Error:', error);
        res.status(500).json({ success: false, message: 'Server error submitting message' });
    }
};

module.exports = { submitContactMessage };
