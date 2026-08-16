const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
function pani(req, res, next) {
    console.log("pani bohot achha hai")
    next()
}
router.get('/register', pani, authController.register);
router.post('/login', authController.login);

module.exports = router;
