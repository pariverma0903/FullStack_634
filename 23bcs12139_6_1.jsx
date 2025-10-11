const express = require('express');
const app = express();
const PORT = 3000;

// Middleware 1: Logging middleware (applied globally)
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

app.use(logger);

// Middleware 2: Bearer token authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== 'mysecrettoken') {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  next();
};

// Public route (no authentication required)
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Protected route (requires Bearer token)
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
