// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const config = require('../config/environment');

const PORT = config.port;

console.log(`
╔════════════════════════════════════════════╗
║   Environment: ${config.nodeEnv.toUpperCase().padEnd(28)} ║
║   Port: ${PORT.toString().padEnd(35)} ║
╚════════════════════════════════════════════╝
`);

// Import routes
const todoRoutes = require('./routes/todos');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging middleware (useful for DevOps monitoring)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (critical for DevOps!)
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
  };
  
  res.status(200).json(healthcheck);
});

// API Routes
app.use('/api/todos', todoRoutes);

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    service: 'DevOps Todo API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});





// Serve frontend for any other routes (SPA support)

// Note: Commented out due to Express 5 path-to-regexp restrictions
// The express.static middleware above already handles serving frontend files
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Only start server if run directly (not when imported by tests)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 DevOps Todo App Server Running       ║
║                                            ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)} ║
║   Port: ${PORT.toString().padEnd(35)} ║
║   URL: http://localhost:${PORT.toString().padEnd(23)} ║
║                                            ║
║   Health: http://localhost:${PORT}/health${' '.repeat(11)} ║
║   API: http://localhost:${PORT}/api/todos${' '.repeat(10)} ║
╚════════════════════════════════════════════╝
  `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}
// Export for testing
module.exports = app;