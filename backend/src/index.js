// Load environment variables FIRST before any other imports
require('dotenv').config();

// Log environment check
console.log('🔍 Environment check:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`  PORT: ${process.env.PORT || 'not set'}`);
console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL ? 'set' : 'not set'}`);
console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'not set'}`);

const express = require('express');
const cors = require('cors');

// Load scheduler with error handling
let startScheduler;
try {
  startScheduler = require('./services/scheduler').startScheduler;
  console.log('✅ Scheduler module loaded');
} catch (error) {
  console.error('⚠️  Failed to load scheduler:', error.message);
  startScheduler = () => console.log('⚠️  Scheduler not available');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Ultra-permissive CORS for Railway/Vercel deployment
const frontendUrl = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.replace(/\/$/, '') // Remove trailing slash
  : 'http://localhost:3000';

const allowedOrigins = [
  'http://localhost:3000',
  frontendUrl,
  'https://devhub-tg.vercel.app',
  'https://devhub-tg.vercel.app/', // With trailing slash too
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 FRONTEND_URL from env:', process.env.FRONTEND_URL);

// Ultra-permissive CORS - allow all origins in production to avoid blocking
app.use(cors({
  origin: function (origin, callback) {
    // Always allow requests with no origin
    if (!origin) {
      return callback(null, true);
    }
    
    // In production, be VERY permissive - allow all vercel.app and railway.app
    if (process.env.NODE_ENV === 'production') {
      // Allow any vercel.app or railway.app domain
      if (origin.includes('vercel.app') || origin.includes('railway.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      // Also check exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In production, allow everything to avoid blocking (can tighten later)
      console.log(`✅ Allowing production origin: ${origin}`);
      return callback(null, true);
    }
    
    // Development: allow all
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Explicit OPTIONS handler as fallback
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

app.use(express.json());

// Routes - with error handling for route loading
try {
  app.use('/api/resources', require('./routes/resources'));
  console.log('✅ Resources route loaded');
} catch (error) {
  console.error('❌ Failed to load resources route:', error.message);
}

try {
  app.use('/api/chat', require('./routes/chat'));
  console.log('✅ Chat route loaded');
} catch (error) {
  console.error('❌ Failed to load chat route:', error.message);
}

try {
  app.use('/api/pathfinder', require('./routes/pathfinder'));
  console.log('✅ Pathfinder route loaded');
} catch (error) {
  console.error('❌ Failed to load pathfinder route:', error.message);
}

try {
  app.use('/api/user', require('./routes/user'));
  console.log('✅ User route loaded');
} catch (error) {
  console.error('❌ Failed to load user route:', error.message);
}

try {
  app.use('/api/gsql-ai', require('./routes/gsql-ai'));
  console.log('✅ GSQL AI route loaded');
} catch (error) {
  console.error('❌ Failed to load GSQL AI route:', error.message);
}

// Health check - should be accessible even if routes fail
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'DevHub API Server',
    status: 'running',
    endpoints: ['/api/health', '/api/resources', '/api/chat', '/api/gsql-ai']
  });
});

// Error handling middleware - ensure CORS headers are set even on errors
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (origin && (origin.includes('vercel.app') || origin.includes('railway.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
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
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit immediately - let the server try to handle it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately - let the server try to handle it
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
