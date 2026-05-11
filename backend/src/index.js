// Load environment variables FIRST before any other imports
require('dotenv').config();

// Log non-sensitive boot info only (no key presence — avoids signalling attackers what's wired up)
console.log(`🔍 Boot: env=${process.env.NODE_ENV || 'development'} port=${process.env.PORT || 3001}`);

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

// CORS: whitelist + safe wildcards for vercel preview / railway. NEVER reflect arbitrary origins
// when `credentials: true` — that's equivalent to disabling SOP.
const frontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, '')
  : 'http://localhost:3000';

const exactAllowed = new Set(
  [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    frontendUrl,
    'https://devhub-tg.vercel.app',
  ].filter(Boolean)
);

// Patterns for preview deploys + railway backends. Tightened to *.vercel.app / *.railway.app only.
const allowedHostPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*railway\.app$/i,
];

function isOriginAllowed(origin) {
  if (!origin) return true; // server-to-server, curl, mobile apps
  const stripped = origin.replace(/\/$/, '');
  if (exactAllowed.has(stripped)) return true;
  return allowedHostPatterns.some((re) => re.test(stripped));
}

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Baseline security headers (replaces need for the `helmet` dep — no new install required).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // HSTS only meaningful over HTTPS; safe to send always (browsers ignore on http://)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  // Hide framework fingerprint
  res.removeHeader('X-Powered-By');
  next();
});
app.disable('x-powered-by');

// Bounded body size — defeats DoS by 100MB JSON POSTs
app.use(express.json({ limit: '100kb' }));

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
  app.use('/api/events', require('./routes/events'));
  console.log('✅ Events route loaded');
} catch (error) {
  console.error('❌ Failed to load events route:', error.message);
}

try {
  app.use('/api/contact', require('./routes/contact'));
  console.log('✅ Contact route loaded');
} catch (error) {
  console.error('❌ Failed to load contact route:', error.message);
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
    endpoints: ['/api/health', '/api/resources', '/api/chat', '/api/pathfinder', '/api/user', '/api/events']
  });
});

// Error handler — log full detail server-side, never leak stack/internals to clients.
app.use((err, req, res, next) => {
  console.error('Error:', err && err.stack ? err.stack : err);

  // Keep CORS sane on error responses — only echo the origin if it's allowed.
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: isDev ? (err.message || 'Internal error') : 'Internal error',
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
