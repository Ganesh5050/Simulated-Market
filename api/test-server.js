// Simple test server to check if port 5050 works
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5050;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', time: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Test signup endpoint
app.post('/auth/signup', (req, res) => {
  console.log('🔐 Test signup received:', req.body);
  res.json({ 
    success: true, 
    message: 'Test signup working',
    token: 'test-token-123',
    user: { id: 'test-user', email: req.body.email }
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log('');
  console.log('🧪 TEST SERVER STARTED!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('✅ Test endpoints ready:');
  console.log('   - GET /test');
  console.log('   - GET /health');
  console.log('   - POST /auth/signup');
  console.log('');
});

module.exports = app;
