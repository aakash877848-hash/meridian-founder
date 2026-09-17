const StartupProfile = require('../models/StartupProfile');
const Shortlist = require('../models/Shortlist');
const Note = require('../models/Note');
const Pipeline = require('../models/Pipeline');
const ConnectionRequest = require('../models/ConnectionRequest');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ---------------------------------------------------------------------------
// Shortlist
// ---------------------------------------------------------------------------

exports.addToShortlist = catchAsync(async (req, res, next) => {
  const { startupId } = req.params;
  const { listName } = req.body;

  const startup = await StartupProfile.findById(startupId);
  if (!startup) return next(new AppError('Startup not found.', 404));

  const entry = await Shortlist.findOneAndUpdate(
    { investor: req.user._id, startup: startupId, listName: listName || 'Default' },
    { investor: req.user._id, startup: startupId, listName: listName || 'Default' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ status: 'success', data: { shortlist: entry } });
});

exports.removeFromShortlist = catchAsync(async (req, res, next) => {
  await Shortlist.findOneAndDelete({ investor: req.user._id, startup: req.params.startupId });
  res.status(200).json({ status: 'success', message: 'Removed from shortlist.' });
});

exports.getMyShortlist = catchAsync(async (req, res, next) => {
  const entries = await Shortlist.find({ investor: req.user._id })
    .populate('startup')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: entries.length, data: { shortlist: entries } });
});

// ---------------------------------------------------------------------------
// Internal notes (never visible to founders)
// ---------------------------------------------------------------------------

exports.addNote = catchAsync(async (req, res, next) => {
  const { content, isPrivateToAuthor } = req.body;
  if (!content || !content.trim()) return next(new AppError('Note content is required.', 400));

  const startup = await StartupProfile.findById(req.params.startupId);
  if (!startup) return next(new AppError('Startup not found.', 404));

  const note = await Note.create({
    startup: req.params.startupId,
    author: req.user._id,
    content,
    isPrivateToAuthor: !!isPrivateToAuthor,
  });

  res.status(201).json({ status: 'success', data: { note } });
});

exports.getNotes = catchAsync(async (req, res, next) => {
  const filter = { startup: req.params.startupId };
  // Notes marked private-to-author are hidden from everyone except their
  // author and admins.
  if (req.user.role !== 'admin') {
    filter.$or = [{ isPrivateToAuthor: false }, { author: req.user._id }];
  }

  const notes = await Note.find(filter).populate('author', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: notes.length, data: { notes } });
});

exports.deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) return next(new AppError('Note not found.', 404));

  if (req.user.role !== 'admin' && String(note.author) !== String(req.user._id)) {
    return next(new AppError('You can only delete your own notes.', 403));
  }
  await note.deleteOne();
  res.status(200).json({ status: 'success', message: 'Note deleted.' });
});

// ---------------------------------------------------------------------------
// Deal pipeline
// ---------------------------------------------------------------------------

exports.getPipeline = catchAsync(async (req, res, next) => {
  const entries = await Pipeline.find({ owner: req.user._id })
    .populate('startup')
    .sort({ updatedAt: -1 });
  res.status(200).json({ status: 'success', results: entries.length, data: { pipeline: entries } });
});

exports.upsertPipelineStage = catchAsync(async (req, res, next) => {
  const { startupId } = req.params;
  const { stage } = req.body;

  const startup = await StartupProfile.findById(startupId);
  if (!startup) return next(new AppError('Startup not found.', 404));

  let entry = await Pipeline.findOne({ owner: req.user._id, startup: startupId });
  if (!entry) {
    entry = new Pipeline({ owner: req.user._id, startup: startupId, stage: 'New' });
  }
  entry.moveTo(stage, req.user._id);
  await entry.save();

  res.status(200).json({ status: 'success', data: { pipeline: entry } });
});

// ---------------------------------------------------------------------------
// Connect with founders
// ---------------------------------------------------------------------------

exports.sendConnectionRequest = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const startup = await StartupProfile.findById(req.params.startupId);
  if (!startup) return next(new AppError('Startup not found.', 404));

  const request = await ConnectionRequest.create({
    startup: startup._id,
    investor: req.user._id,
    founder: startup.founder,
    message,
  });

  // In a full production build, trigger an email/notification to the founder here.

  res.status(201).json({ status: 'success', data: { request } });
});

exports.getMySentRequests = catchAsync(async (req, res, next) => {
  const requests = await ConnectionRequest.find({ investor: req.user._id })
    .populate('startup', 'startupName logoUrl')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: requests.length, data: { requests } });
});

// Founder-side: view and respond to incoming requests
exports.getMyReceivedRequests = catchAsync(async (req, res, next) => {
  const requests = await ConnectionRequest.find({ founder: req.user._id })
    .populate('investor', 'name email organization')
    .populate('startup', 'startupName')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: requests.length, data: { requests } });
});

exports.respondToRequest = catchAsync(async (req, res, next) => {
  const { status } = req.body; // 'accepted' | 'declined'
  if (!['accepted', 'declined'].includes(status)) {
    return next(new AppError('Status must be accepted or declined.', 400));
  }

  const request = await ConnectionRequest.findOne({ _id: req.params.requestId, founder: req.user._id });
  if (!request) return next(new AppError('Request not found.', 404));

  request.status = status;
  await request.save();

  res.status(200).json({ status: 'success', data: { request } });
});
