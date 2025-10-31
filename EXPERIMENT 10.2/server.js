// server.js
// Blog Platform with Comments and User Profiles
// Single-file backend using Express + Mongoose + JWT auth
//
// Required packages:
// npm install express mongoose dotenv bcrypt jsonwebtoken cors

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_platform';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';

// --- Connect MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Schemas & Models

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [String],
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
// Note: comments are embedded in Post.comments as subdocuments

// --- Middleware: auth
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing auth token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// --- Helpers
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// --- Routes

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, bio, avatarUrl } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ message: 'Username or email already taken' });

    const passwordHash = await hashPassword(password);
    const user = new User({ username, email, passwordHash, bio: bio || '', avatarUrl: avatarUrl || '' });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// USER: Get profile (public)
app.get('/api/users/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const user = await User.findById(uid).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also return basic stats: postCount, recent posts (titles & ids)
    const posts = await Post.find({ author: uid }).sort({ createdAt: -1 }).limit(10).select('title createdAt');
    const postCount = await Post.countDocuments({ author: uid });

    res.json({
      user,
      postCount,
      recentPosts: posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// POSTS: list (public)
app.get('/api/posts', async (req, res) => {
  try {
    // optional query params: ?tag=, ?author=, ?q=
    const { tag, author, q, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { body: new RegExp(q, 'i') }
    ];

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.max(1, parseInt(limit)))
      .populate('author', 'username avatarUrl');

    const total = await Post.countDocuments(filter);

    res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// POSTS: create (auth)
app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });

    const post = new Post({
      author: req.user.id,
      title,
      body,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.length ? tags.split(',').map(s => s.trim()) : [])
    });

    await post.save();
    await post.populate('author', 'username avatarUrl');

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// POSTS: get single (public)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatarUrl')
      .populate('comments.author', 'username avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// POSTS: update (author only)
app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { title, body, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (body !== undefined) post.body = body;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()) : post.tags);

    post.updatedAt = Date.now();
    await post.save();
    await post.populate('author', 'username avatarUrl');

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// POSTS: delete (author only)
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// COMMENTS: add a comment to a post (auth)
app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = { author: req.user.id, text: text.trim() };
    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'username avatarUrl');

    // return the last comment (the one just added)
    const last = post.comments[post.comments.length - 1];
    res.status(201).json(last);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// COMMENTS: delete comment (comment author OR post author can delete)
app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId).populate('comments.author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isCommentAuthor = comment.author && comment.author._id.toString() === req.user.id;
    const isPostAuthor = post.author.toString() === req.user.id;
    if (!isCommentAuthor && !isPostAuthor) return res.status(403).json({ message: 'Not authorized to delete comment' });

    comment.remove();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

// PROFILE: update current user's profile
app.put('/api/me', authMiddleware, async (req, res) => {
  try {
    const { bio, avatarUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();
    const safe = { id: user._id, username: user.username, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl };
    res.json({ user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
