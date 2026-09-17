const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StartupProfile = require('../models/StartupProfile');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendAuthCookies, clearAuthCookies, signAccessToken } = require('../utils/tokens');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

// Only founders and investors can self-register. Admin accounts are
// provisioned separately (seed script / by an existing admin) so that
// nobody can grant themselves admin access via the public API.
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, organization } = req.body;

  if (!['founder', 'investor'].includes(role)) {
    return next(new AppError('Role must be either "founder" or "investor".', 400));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    organization: role === 'investor' ? organization : undefined,
  });

  sendAuthCookies(res, user);
  res.status(201).json({ status: 'success', data: { user: publicUser(user) } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (user.isLocked) {
    return next(new AppError('Account temporarily locked due to repeated failed logins. Try again later.', 423));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.registerFailedLogin();
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated. Contact an administrator.', 403));
  }

  await user.registerSuccessfulLogin();
  sendAuthCookies(res, user);
  res.status(200).json({ status: 'success', data: { user: publicUser(user) } });
});

exports.logout = (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ status: 'success', message: 'Logged out.' });
};

// Rotates a short-lived access token using the longer-lived refresh token.
exports.refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return next(new AppError('No refresh token provided.', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new AppError('User no longer exists or is inactive.', 401));
  }

  const accessToken = signAccessToken(user);
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.status(200).json({ status: 'success', message: 'Token refreshed.' });
});

exports.me = catchAsync(async (req, res, next) => {
  const user = req.user;
  let hasStartupProfile = false;
  if (user.role === 'founder') {
    hasStartupProfile = !!(await StartupProfile.exists({ founder: user._id }));
  }
  res.status(200).json({ status: 'success', data: { user: publicUser(user), hasStartupProfile } });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }
  user.password = newPassword;
  await user.save();

  sendAuthCookies(res, user);
  res.status(200).json({ status: 'success', message: 'Password updated.' });
});
