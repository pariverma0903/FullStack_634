// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// === MongoDB Connection ===
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blog_ci_cd";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => console.log("✅ MongoDB Connected"));

// === Schemas ===
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: String,
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

// === Routes ===

// Root health check (for testing)
app.get("/", (req, res) => res.send("🚀 Blog Platform API Running"));

// Create new user
app.post("/api/users", async (req, res) => {
  const { username, email } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });
  const user = new User({ username, email });
  await user.save();
  res.status(201).json(user);
});

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Create new post
app.post("/api/posts", async (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !author) return res.status(400).json({ error: "Missing title or author" });
  const post = new Post({ title, content, author });
  await post.save();
  res.status(201).json(await post.populate("author"));
});

// Get all posts
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().populate("author");
  res.json(posts);
});

// Create comment
app.post("/api/comments", async (req, res) => {
  const { text, post, author } = req.body;
  if (!text || !post || !author) return res.status(400).json({ error: "Missing fields" });
  const comment = new Comment({ text, post, author });
  await comment.save();
  res.status(201).json(await comment.populate(["author", "post"]));
});

// Get comments for a post
app.get("/api/posts/:id/comments", async (req, res) => {
  const comments = await Comment.find({ post: req.params.id }).populate("author");
  res.json(comments);
});

// === Serve React build ===
app.use(express.static(path.join(__dirname, "frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app; // Exported for GitHub Action tests
