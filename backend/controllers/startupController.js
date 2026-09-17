const path = require('path');
const fs = require('fs');
const StartupProfile = require('../models/StartupProfile');
const ConnectionRequest = require('../models/ConnectionRequest');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ---------------------------------------------------------------------------
// FOUNDER-SIDE: create/update/read the founder's own startup profile
// ---------------------------------------------------------------------------

const ALLOWED_FIELDS = [
  'founderDetails',
  'startupName',
  'tagline',
  'description',
  'logoUrl',
  'foundedYear',
  'sector',
  'subSector',
  'stage',
  'location',
  'businessModel',
  'traction',
  'fundraising',
  'team',
  'teamSize',
  'website',
  'linkedInUrl',
  'twitterUrl',
  'visibility',
  'status',
  'tags',
];

const pickAllowed = (body) => {
  const out = {};
  ALLOWED_FIELDS.forEach((key) => {
    if (body[key] !== undefined) out[key] = body[key];
  });
  return out;
};

exports.getMyStartup = catchAsync(async (req, res, next) => {
  const startup = await StartupProfile.findOne({ founder: req.user._id });
  if (!startup) {
    return res.status(200).json({ status: 'success', data: { startup: null } });
  }
  res.status(200).json({ status: 'success', data: { startup } });
});

exports.upsertMyStartup = catchAsync(async (req, res, next) => {
  const updates = pickAllowed(req.body);

  // Founders may never self-verify or set restricted internal fields.
  delete updates.verification;
  delete updates.matchScores;
  if (updates.status === 'verified') delete updates.status;

  let startup = await StartupProfile.findOne({ founder: req.user._id });

  if (!startup) {
    startup = await StartupProfile.create({ ...updates, founder: req.user._id });
    return res.status(201).json({ status: 'success', data: { startup } });
  }

  Object.assign(startup, updates);
  await startup.save();
  res.status(200).json({ status: 'success', data: { startup } });
});

exports.uploadMyDocuments = catchAsync(async (req, res, next) => {
  const startup = await StartupProfile.findOne({ founder: req.user._id });
  if (!startup) return next(new AppError('Create your startup profile before uploading documents.', 400));

  if (!req.files || req.files.length === 0) {
    return next(new AppError('No files were uploaded.', 400));
  }

  const docType = req.body.type && ['pitch_deck', 'financials', 'cap_table', 'other'].includes(req.body.type)
    ? req.body.type
    : 'other';

  const newDocs = req.files.map((file) => ({
    name: file.originalname,
    type: docType,
    url: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  }));

  startup.documents.push(...newDocs);
  await startup.save();

  res.status(201).json({ status: 'success', data: { documents: startup.documents } });
});

exports.deleteMyDocument = catchAsync(async (req, res, next) => {
  const startup = await StartupProfile.findOne({ founder: req.user._id });
  if (!startup) return next(new AppError('Startup profile not found.', 404));

  const doc = startup.documents.id(req.params.docId);
  if (!doc) return next(new AppError('Document not found.', 404));

  const filePath = path.join(__dirname, '..', 'uploads', path.basename(doc.url));
  fs.unlink(filePath, () => {}); // best-effort cleanup, ignore errors

  doc.deleteOne();
  await startup.save();

  res.status(200).json({ status: 'success', message: 'Document removed.' });
});

// ---------------------------------------------------------------------------
// INVESTOR/ADMIN-SIDE: search, filter, and view startup profiles
// ---------------------------------------------------------------------------

// Masks sensitive founder contact details from investors until a connection
// has been explicitly accepted by the founder. Admins always see everything.
const sanitizeForViewer = async (startupDoc, viewer) => {
  const startup = startupDoc.toObject();
  if (viewer.role === 'admin') return startup;

  if (viewer.role === 'investor') {
    const accepted = await ConnectionRequest.exists({
      startup: startup._id,
      investor: viewer._id,
      status: 'accepted',
    });
    if (!accepted) {
      startup.founderDetails = {
        ...startup.founderDetails,
        email: '••••••••',
        phone: '••••••••',
      };
    }
  }
  return startup;
};

exports.getStartupById = catchAsync(async (req, res, next) => {
  const startup = await StartupProfile.findById(req.params.id).populate('founder', 'name email');
  if (!startup) return next(new AppError('Startup profile not found.', 404));

  if (req.user.role === 'investor') {
    if (startup.visibility === 'hidden' || startup.status === 'draft') {
      return next(new AppError('This profile is not available.', 404));
    }
  }

  const sanitized = await sanitizeForViewer(startup, req.user);
  res.status(200).json({ status: 'success', data: { startup: sanitized } });
});

// Builds a MongoDB query from supported filter query-params.
const buildFilterQuery = (query) => {
  const filter = {};

  if (query.sector) filter.sector = { $in: [].concat(query.sector) };
  if (query.subSector) filter.subSector = new RegExp(query.subSector, 'i');
  if (query.stage) filter.stage = { $in: [].concat(query.stage) };
  if (query.businessModel) filter.businessModel = { $in: [].concat(query.businessModel) };
  if (query.country) filter['location.country'] = new RegExp(`^${query.country}$`, 'i');
  if (query.city) filter['location.city'] = new RegExp(query.city, 'i');

  if (query.minAsk || query.maxAsk) {
    filter['fundraising.amountSeekingUSD'] = {};
    if (query.minAsk) filter['fundraising.amountSeekingUSD'].$gte = Number(query.minAsk);
    if (query.maxAsk) filter['fundraising.amountSeekingUSD'].$lte = Number(query.maxAsk);
  }

  if (query.minRevenue) {
    filter['traction.annualRevenueUSD'] = { $gte: Number(query.minRevenue) };
  }

  if (query.minTeamSize) {
    filter.teamSize = { $gte: Number(query.minTeamSize) };
  }

  if (query.verifiedOnly === 'true') {
    filter['verification.isVerified'] = true;
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  return filter;
};

exports.searchStartups = catchAsync(async (req, res, next) => {
  const filter = buildFilterQuery(req.query);

  // Investors only ever see submitted/verified, non-hidden profiles.
  if (req.user.role === 'investor') {
    filter.status = { $in: ['submitted', 'verified'] };
    filter.visibility = { $ne: 'hidden' };
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const sortMap = {
    newest: { createdAt: -1 },
    revenue: { 'traction.annualRevenueUSD': -1 },
    fundraisingAmount: { 'fundraising.amountSeekingUSD': -1 },
    completeness: { profileCompleteness: -1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.newest;

  const [results, total] = await Promise.all([
    StartupProfile.find(filter)
      .select('-documents')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    StartupProfile.countDocuments(filter),
  ]);

  const sanitized = await Promise.all(results.map((s) => sanitizeForViewer(s, req.user)));

  res.status(200).json({
    status: 'success',
    results: sanitized.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { startups: sanitized },
  });
});

// ---------------------------------------------------------------------------
// ADMIN-ONLY
// ---------------------------------------------------------------------------

exports.adminListAll = catchAsync(async (req, res, next) => {
  const filter = buildFilterQuery(req.query);
  if (req.query.status) filter.status = req.query.status;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const [results, total] = await Promise.all([
    StartupProfile.find(filter)
      .populate('founder', 'name email isActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    StartupProfile.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: results.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { startups: results },
  });
});

exports.adminVerifyStartup = catchAsync(async (req, res, next) => {
  const startup = await StartupProfile.findById(req.params.id);
  if (!startup) return next(new AppError('Startup profile not found.', 404));

  startup.verification.isVerified = true;
  startup.verification.verifiedAt = new Date();
  startup.verification.verifiedBy = req.user._id;
  startup.status = 'verified';
  await startup.save();

  res.status(200).json({ status: 'success', data: { startup } });
});

exports.adminSetVisibility = catchAsync(async (req, res, next) => {
  const { visibility } = req.body;
  const startup = await StartupProfile.findByIdAndUpdate(
    req.params.id,
    { visibility },
    { new: true, runValidators: true }
  );
  if (!startup) return next(new AppError('Startup profile not found.', 404));
  res.status(200).json({ status: 'success', data: { startup } });
});
