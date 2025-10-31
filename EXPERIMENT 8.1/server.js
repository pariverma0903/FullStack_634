// server.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Simple in-memory mock user
const mockUser = {
  email: "test@example.com",
  password: "123456",
};

// Home
app.get("/", (req, res) => res.send("🚀 Backend running for Login Form Demo"));

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === mockUser.email && password === mockUser.password) {
    return res.json({ success: true, message: "Login successful!" });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
