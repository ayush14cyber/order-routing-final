const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole('admin'), warehouseController.createWarehouse);
router.get('/', verifyToken, warehouseController.getWarehouses);
router.get('/:id', verifyToken, warehouseController.getWarehouseById);
router.put('/:id', verifyToken, requireRole('admin'), warehouseController.updateWarehouse);

module.exports = router;
