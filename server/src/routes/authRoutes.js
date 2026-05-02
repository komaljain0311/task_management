const express = require('express');
const router = express.Router();
const { signup, login, getMe, getUsers, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);

module.exports = router;
