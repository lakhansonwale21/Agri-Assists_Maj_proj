const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, financialController.addRecord);
router.get('/', authenticateToken, financialController.getRecords);
router.get('/summary', authenticateToken, financialController.getSummary);

module.exports = router;
