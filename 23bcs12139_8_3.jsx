//Setup the project

mkdir rbac-jwt
cd rbac-jwt
npm init -y
npm install express jsonwebtoken body-parser


//Create the server file (server.js)

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Secret key for JWT signing
const JWT_SECRET = 'super_secret_key';

// Use JSON parser
app.use(bodyParser.json());

// -------------------- Sample Users --------------------
// Hardcoded for simplicity
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'moderator', password: 'mod123', role: 'moderator' },
  { id: 3, username: 'user', password: 'user123', role: 'user' },
];

// -------------------- LOGIN ROUTE --------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Create JWT with role in payload
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// -------------------- JWT VERIFICATION MIDDLEWARE --------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = decoded; // attach decoded payload to request
    next();
  });
}

// -------------------- ROLE AUTHORIZATION MIDDLEWARE --------------------
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

// -------------------- PROTECTED ROUTES --------------------

// Admin-only route
app.get('/admin/dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.username}!` });
});

// Moderator-only route
app.get('/moderator/manage', verifyToken, authorizeRoles('moderator'), (req, res) => {
  res.json({ message: `Welcome Moderator ${req.user.username}!` });
});

// User route (all roles allowed)
app.get('/user/profile', verifyToken, authorizeRoles('user', 'admin', 'moderator'), (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is your profile.` });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//Testing RBAC

//Step 1: Login to get token

POST http://localhost:3000/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

//Response:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}

//Step 2: Access routes

GET /admin/dashboard
Authorization: Bearer <token>

//Moderator route

  GET /moderator/manage
Authorization: Bearer <token>
  
//User profile route
  
  GET /user/profile
Authorization: Bearer <token>


