// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Support multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // In production, be more permissive to avoid blocking legitimate requests
    // Railway and other platforms may use different origins
    if (process.env.NODE_ENV === 'production') {
      // Allow if it matches our frontend URL or is a known good origin
      if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '').split('/')[0]))) {
        return callback(null, true);
      }
      // Also allow Railway internal requests
      if (origin.includes('railway.app') || origin.includes('vercel.app')) {
        return callback(null, true);
      }
    }
    
    // Development: allow localhost
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log for debugging but allow in production to avoid blocking
      console.warn(`⚠️  CORS: Origin not in allowed list: ${origin}`);
      callback(null, true); // Allow anyway in production to avoid blocking
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/resources', require('./routes/resources'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pathfinder', require('./routes/pathfinder'));
app.use('/api/user', require('./routes/user'));
app.use('/api/gsql-ai', require('./routes/gsql-ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DevHub API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
  
  // Start YouTube sync scheduler (non-blocking, wrapped in try-catch)
  try {
    startScheduler();
  } catch (error) {
    console.error('⚠️  Scheduler initialization failed (non-critical):', error.message);
    // Continue even if scheduler fails - app should still work
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
