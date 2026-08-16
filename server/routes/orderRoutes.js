const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole('admin'), orderController.createOrder);
router.post('/generate-random', verifyToken, requireRole('admin'), orderController.generateRandomOrderRoute);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id', verifyToken, requireRole('admin', 'manager'), orderController.updateOrder);

module.exports = router;
