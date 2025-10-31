// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(express.json());
app.use(cors());

// === MongoDB Connection (optional) ===
const MONGO_URI = process.env.MONGO_URI || "";
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB not connected:", err.message));
} else {
  console.log("⚠️ Skipping MongoDB connection (no URI provided)");
}

// === Simple Schema (optional) ===
const TodoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
});
const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

// === API Routes ===

// Health check (for ALB)
app.get("/", (req, res) => {
  res.send(`✅ Backend is running on instance: ${os.hostname()}`);
});

// Get all todos
app.get("/api/todos", async (req, res) => {
  if (!MONGO_URI) return res.json([{ text: "Sample Todo (no DB)", completed: false }]);
  const todos = await Todo.find();
  res.json(todos);
});

// Add new todo
app.post("/api/todos", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  if (!MONGO_URI) return res.json({ text, completed: false });

  const todo = new Todo({ text, completed: false });
  await todo.save();
  res.status(201).json(todo);
});

// Update todo
app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (!MONGO_URI) return res.json({ id, completed });
  const updated = await Todo.findByIdAndUpdate(id, { completed }, { new: true });
  res.json(updated);
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  if (!MONGO_URI) return res.json({ deleted: id });
  await Todo.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
