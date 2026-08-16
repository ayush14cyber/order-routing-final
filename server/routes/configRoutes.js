const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, configController.getConfig);
router.put('/', verifyToken, requireRole('admin'), configController.updateConfig);

module.exports = router;
