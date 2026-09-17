const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/users', adminController.listUsers);
router.post('/users', adminController.createInvestorOrAdmin);
router.patch('/users/:userId/active', adminController.setUserActive);
router.get('/stats', adminController.platformStats);

module.exports = router;
