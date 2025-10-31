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
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rbacapp";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// === Schemas & Models ===
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// === Middleware for Auth ===
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

// === RBAC Middleware ===
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient role" });
    }
    next();
  };
}

// === Routes ===

// Root route
app.get("/", (req, res) => res.send("🚀 RBAC API is running!"));

// Register (default user)
app.post("/api/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hash, role: role || "user" });
  try {
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "1d" }
  );
  res.json({ token, role: user.role });
});

// Create post (any logged-in user)
app.post("/api/posts", auth, authorize("user", "admin"), async (req, res) => {
  const post = new Post({ user: req.user.id, content: req.body.content });
  await post.save();
  res.status(201).json(await post.populate("user", "username"));
});

// Get all posts (any logged-in user)
app.get("/api/posts", auth, async (req, res) => {
  const posts = await Post.find().populate("user", "username role");
  res.json(posts);
});

// Admin-only: get all users
app.get("/api/users", auth, authorize("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Admin-only: delete a post
app.delete("/api/posts/:id", auth, authorize("admin"), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted by admin" });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
