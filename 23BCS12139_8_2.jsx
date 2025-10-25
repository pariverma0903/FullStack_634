//Setup the project
mkdir jwt-protected-routes
cd jwt-protected-routes
npm init -y
npm install express jsonwebtoken body-parser


// Create the main server file (server.js)
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Secret key for JWT signing
const JWT_SECRET = 'your_secret_key_here';

// Use body parser to read JSON payloads
app.use(bodyParser.json());

// Sample user (hardcoded for simplicity)
const sampleUser = {
  id: 1,
  username: 'testuser',
  password: 'password123' // never store plaintext passwords in production
};

// -------------------- LOGIN ROUTE --------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (username === sampleUser.username && password === sampleUser.password) {
    // Create JWT token
    const token = jwt.sign(
      { id: sampleUser.id, username: sampleUser.username },
      JWT_SECRET,
      { expiresIn: '1h' } // token expires in 1 hour
    );
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// -------------------- JWT MIDDLEWARE --------------------
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

// -------------------- PROTECTED ROUTE --------------------
app.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username}! You have access to this protected route.`,
    user: req.user
  });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//Test the API

//Step 1: Login to get a token

POST http://localhost:3000/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

//Response:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}


//Step 2: Access protected route with the token

GET http://localhost:3000/dashboard
Authorization: Bearer <token>
//Response:

  {
  "message": "Welcome testuser! You have access to this protected route.",
  "user": {
    "id": 1,
    "username": "testuser",
    "iat": 1698253302,
    "exp": 1698256902
  }
}

//Step 3: Access protected route without token or with invalid token

{
  "message": "Authorization header missing"
}
//or

{
  "message": "Invalid or expired token"
}
