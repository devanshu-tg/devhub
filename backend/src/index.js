// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.listen(PORT, () => {
  console.log(`🚀 DevHub API running on http://localhost:${PORT}`);
  
  // Start YouTube sync scheduler
  startScheduler();
});
