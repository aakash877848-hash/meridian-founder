const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { runValidation, registerRules, loginRules } = require('../middleware/validate');

const router = express.Router();

// Stricter limiter for auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, registerRules, runValidation, authController.register);
router.post('/login', authLimiter, loginRules, runValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.patch('/update-password', protect, authController.updateMyPassword);

module.exports = router;
