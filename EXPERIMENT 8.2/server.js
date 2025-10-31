// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// === MongoDB Connection ===
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jwtAuthDB";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// === User Schema ===
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// === JWT Middleware ===
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

// === Routes ===

// Home
app.get("/", (req, res) => res.send("🚀 JWT Authentication API is running!"));

// Register
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hash });

  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET || "mysecretkey",
    { expiresIn: "1d" }
  );

  res.json({ token });
});

// Protected Route
app.get("/api/profile", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ message: "Welcome to your profile!", user });
});

// Another Protected Example
app.get("/api/secret", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.username}, you have accessed a protected route!`,
  });
});

// === Start Server ===
const PORT = process.env.PO
