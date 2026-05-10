const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/prices', marketController.getMarketPrices);
router.post('/seed', marketController.seedMarketPrices); // For initial setup

module.exports = router;
