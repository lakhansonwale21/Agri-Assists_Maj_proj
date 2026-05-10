const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Ensure all routes under /api/admin are protected
router.use(authenticateToken, authorizeRole(['admin']));

router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getStats);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

router.get('/messages', adminController.getMessages);
router.delete('/messages/:id', adminController.deleteAdminMessage);

module.exports = router;
