require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const startupRoutes = require('./routes/startupRoutes');
const vcRoutes = require('./routes/vcRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

// Trust proxy (needed for secure cookies / rate limiting behind a load balancer)
app.set('trust proxy', 1);

// ---- Security middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators from user input to prevent NoSQL injection
app.use(hpp()); // prevents HTTP parameter pollution

// General API rate limiter (auth routes have their own stricter limiter)
app.use(
  '/api',
  rateLimit({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static file serving for uploaded documents (pitch decks, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Routes ----
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/vc', vcRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥', err);
});
