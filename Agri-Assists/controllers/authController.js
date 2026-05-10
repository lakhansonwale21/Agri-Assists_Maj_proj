const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, city, state, farmSize, mainCrop, shopName, shopAddress } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            city,
            state: role === 'farmer' ? state : undefined,
            farmSize: role === 'farmer' ? farmSize : undefined,
            mainCrop: role === 'farmer' ? mainCrop : undefined,
            shopName: role === 'shopkeeper' ? shopName : undefined,
            shopAddress: role === 'shopkeeper' ? shopAddress : undefined
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, city: user.city },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.json({ success: true, token, role: user.role, user: { name: user.name, email: user.email, role: user.role, city: user.city } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, phone, city, state, farmSize, mainCrop, shopName, shopAddress } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.city = city || user.city;
        
        if (user.role === 'farmer') {
            user.state = state || user.state;
            user.farmSize = farmSize || user.farmSize;
            user.mainCrop = mainCrop || user.mainCrop;
        } else if (user.role === 'shopkeeper') {
            user.shopName = shopName || user.shopName;
            user.shopAddress = shopAddress || user.shopAddress;
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
}

module.exports = { register, login, getProfile, updateProfile };
