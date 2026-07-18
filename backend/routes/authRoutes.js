const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../middleware/validators');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
