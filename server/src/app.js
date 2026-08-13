const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

// Enable CORS for frontend client
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const readinessRoutes = require('./routes/readinessRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const mentorRoutes = require('./routes/mentorRoutes');

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentor', mentorRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
