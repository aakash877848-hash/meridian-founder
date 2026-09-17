const express = require('express');
const startupController = require('../controllers/startupController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

// ---- Founder-only ----
router.get('/me', restrictTo('founder'), startupController.getMyStartup);
router.put('/me', restrictTo('founder'), startupController.upsertMyStartup);
router.post(
  '/me/documents',
  restrictTo('founder'),
  upload.array('documents', 5),
  startupController.uploadMyDocuments
);
router.delete('/me/documents/:docId', restrictTo('founder'), startupController.deleteMyDocument);

// ---- Investor + Admin: search and view ----
router.get('/search', restrictTo('investor', 'admin'), startupController.searchStartups);
router.get('/:id', restrictTo('investor', 'admin'), startupController.getStartupById);

// ---- Admin-only management ----
router.get('/', restrictTo('admin'), startupController.adminListAll);
router.patch('/:id/verify', restrictTo('admin'), startupController.adminVerifyStartup);
router.patch('/:id/visibility', restrictTo('admin'), startupController.adminSetVisibility);

module.exports = router;
