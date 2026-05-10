const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lakhanhsonwale2142_db_user:L%40khan2142@smartagriassist.71outtj.mongodb.net/?appName=SmartAgriAssist';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@agri-assists.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('SecureAdmin123!', 10);

        const adminUser = new User({
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            phone: '1234567890',
            role: 'admin',
            city: 'System',
        });

        await adminUser.save();
        console.log('Admin user seeded successfully. You can now log in with admin@agri-assists.com / SecureAdmin123!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
