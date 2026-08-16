const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/route-order', verifyToken, requireRole('admin'), routingController.routeOrder);
router.get('/routing-history', verifyToken, routingController.getRoutingHistory);
router.get('/routing-history/:orderId', verifyToken, routingController.getRoutingHistoryById);

module.exports = router;
