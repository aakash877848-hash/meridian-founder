const express = require('express');
const vcController = require('../controllers/vcController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Shortlist
router.get('/shortlist', restrictTo('investor', 'admin'), vcController.getMyShortlist);
router.post('/shortlist/:startupId', restrictTo('investor', 'admin'), vcController.addToShortlist);
router.delete('/shortlist/:startupId', restrictTo('investor', 'admin'), vcController.removeFromShortlist);

// Notes
router.get('/startups/:startupId/notes', restrictTo('investor', 'admin'), vcController.getNotes);
router.post('/startups/:startupId/notes', restrictTo('investor', 'admin'), vcController.addNote);
router.delete('/notes/:noteId', restrictTo('investor', 'admin'), vcController.deleteNote);

// Pipeline
router.get('/pipeline', restrictTo('investor', 'admin'), vcController.getPipeline);
router.put('/pipeline/:startupId', restrictTo('investor', 'admin'), vcController.upsertPipelineStage);

// Connection requests (investor -> founder)
router.post('/startups/:startupId/connect', restrictTo('investor', 'admin'), vcController.sendConnectionRequest);
router.get('/connections/sent', restrictTo('investor', 'admin'), vcController.getMySentRequests);

// Founder-side inbox
router.get('/connections/received', restrictTo('founder'), vcController.getMyReceivedRequests);
router.patch('/connections/:requestId/respond', restrictTo('founder'), vcController.respondToRequest);

module.exports = router;
