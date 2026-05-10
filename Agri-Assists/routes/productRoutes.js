const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, productController.getProducts);
router.get('/shop', authenticateToken, authorizeRole(['shopkeeper']), productController.getShopProducts);
router.post('/', authenticateToken, authorizeRole(['shopkeeper']), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRole(['shopkeeper']), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole(['shopkeeper']), productController.deleteProduct);

module.exports = router;
