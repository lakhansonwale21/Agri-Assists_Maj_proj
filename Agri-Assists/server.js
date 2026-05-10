const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lakhanhsonwale2142_db_user:L%40khan2142@smartagriassist.71outtj.mongodb.net/?appName=SmartAgriAssist';
mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const requestRoutes = require('./routes/requestRoutes');
const marketRoutes = require('./routes/marketRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const financialRoutes = require('./routes/financialRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/market', marketRoutes);
app.get('/api/market-prices', require('./controllers/marketController').getMarketPricesDirect); // direct state/district/commodity filter
app.use('/api/weather', weatherRoutes);
app.use('/api/finance', financialRoutes);
app.get('/api/public-settings', require('./controllers/adminController').getPublicSettings);
app.post('/api/contact', require('./controllers/contactController').submitContactMessage);
app.use('/api/admin', adminRoutes);

// View Routes
const viewsDir = path.join(__dirname, 'views');

app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(viewsDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(viewsDir, 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(viewsDir, 'dashboard.html')));
app.get('/market', (req, res) => res.sendFile(path.join(viewsDir, 'market.html')));
app.get('/shops', (req, res) => res.sendFile(path.join(viewsDir, 'shops.html')));
app.get('/products', (req, res) => res.sendFile(path.join(viewsDir, 'products.html')));
app.get('/requests', (req, res) => res.sendFile(path.join(viewsDir, 'requests.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(viewsDir, 'profile.html')));
app.get('/finance', (req, res) => res.sendFile(path.join(viewsDir, 'finance.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(viewsDir, 'admin.html')));
app.get('/about', (req, res) => res.sendFile(path.join(viewsDir, 'about.html')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: ' Error', error: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(` is running on port ${PORT}`);
});
