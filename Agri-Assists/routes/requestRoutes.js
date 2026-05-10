const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRole(['farmer']), requestController.createRequest);
router.get('/', authenticateToken, requestController.getRequests);
router.put('/:id', authenticateToken, authorizeRole(['shopkeeper']), requestController.updateRequestStatus);

module.exports = router;
