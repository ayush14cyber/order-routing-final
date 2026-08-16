const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole('admin'), productController.createProduct);
router.get('/', verifyToken, productController.getProducts);

module.exports = router;
