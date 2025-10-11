const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Secret key for JWT signing
const SECRET_KEY = 'mysecretkey';

// Hardcoded user credentials
const USER = { username: 'user1', password: 'password123' };

// Simulated user balance
let balance = 1000;

// =============================
// Middleware: Token Verification
// =============================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Token missing' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

// =============================
// Route: Login
// =============================
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// =============================
// Protected Route: Check Balance
// =============================
app.get('/balance', verifyToken, (req, res) => {
  res.status(200).json({ balance });
});

// =============================
// Protected Route: Deposit
// =============================
app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid deposit amount' });
  }

  balance += amount;
  res.status(200).json({
    message: `Deposited $${amount}`,
    newBalance: balance,
  });
});

// =============================
// Protected Route: Withdraw
// =============================
app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal amount' });
  }

  if (amount > balance) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  balance -= amount;
  res.status(200).json({
    message: `Withdrew $${amount}`,
    newBalance: balance,
  });
});

// =============================
// Start Server
// =============================
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
