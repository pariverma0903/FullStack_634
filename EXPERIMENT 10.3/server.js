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
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/socialmediaapp";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// === Models ===
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// === Middleware ===
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// === Routes ===

// Root health check (for AWS load balancer)
app.get("/", (req, res) => res.send("🚀 Social Media API is running!"));

// Register user
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hash });
  try {
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: "Username or email already exists" });
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
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "1d" }
  );
  res.json({ token });
});

// Create post
app.post("/api/posts", auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });

  const post = new Post({ user: req.user.id, content });
  await post.save();
  res.status(201).json(await post.populate("user", "username"));
});

// Get all posts
app.get("/api/posts", auth, async (req, res) => {
  const posts = await Post.find()
    .populate("user", "username")
    .sort({ createdAt: -1 });
  res.json(posts);
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
