const User = require('../models/User');
const StartupProfile = require('../models/StartupProfile');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.listUsers = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

exports.createInvestorOrAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, role, organization } = req.body;
  if (!['investor', 'admin'].includes(role)) {
    return next(new AppError('Role must be investor or admin.', 400));
  }
  const user = await User.create({ name, email, password, role, organization });
  res.status(201).json({ status: 'success', data: { user } });
});

exports.setUserActive = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.userId, { isActive }, { new: true });
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

exports.platformStats = catchAsync(async (req, res, next) => {
  const [totalFounders, totalInvestors, totalStartups, byStage, bySector, submitted] = await Promise.all([
    User.countDocuments({ role: 'founder' }),
    User.countDocuments({ role: 'investor' }),
    StartupProfile.countDocuments(),
    StartupProfile.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    StartupProfile.aggregate([{ $group: { _id: '$sector', count: { $sum: 1 } } }]),
    StartupProfile.countDocuments({ status: { $in: ['submitted', 'verified'] } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalFounders,
      totalInvestors,
      totalStartups,
      submittedProfiles: submitted,
      byStage,
      bySector,
    },
  });
});
