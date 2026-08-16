const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole('admin'), inventoryController.createInventory);
router.get('/', verifyToken, inventoryController.getInventory);
router.put('/:id', verifyToken, requireRole('admin', 'manager'), inventoryController.updateInventory);

module.exports = router;
