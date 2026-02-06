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

// Middleware - Simplified CORS Configuration
const frontendUrl = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.replace(/\/$/, '') // Remove trailing slash
  : 'http://localhost:3000';

const allowedOrigins = [
  'http://localhost:3000',
  frontendUrl,
  'https://devhub-tg.vercel.app', // Explicitly add your Vercel URL
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 FRONTEND_URL from env:', process.env.FRONTEND_URL);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is exactly in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Allowing exact match: ${origin}`);
      return callback(null, true);
    }
    
    // In production, also allow vercel.app and railway.app domains
    if (process.env.NODE_ENV === 'production') {
      if (origin.includes('vercel.app') || origin.includes('railway.app')) {
        console.log(`✅ Allowing production origin: ${origin}`);
        return callback(null, true);
      }
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Allowing development origin: ${origin}`);
      return callback(null, true);
    }
    
    // Log blocked origin for debugging
    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    
    // Block in production if not allowed
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
}));
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
