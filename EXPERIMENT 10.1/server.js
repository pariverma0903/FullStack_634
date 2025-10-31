// server.js
app.use(express.json());


// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todos_db';
const PORT = process.env.PORT || 5000;


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// Schema & Model
const todoSchema = new mongoose.Schema({
text: { type: String, required: true },
completed: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', todoSchema);


// CRUD Endpoints


// Get all todos
app.get('/api/todos', async (req, res) => {
try {
const todos = await Todo.find().sort({ createdAt: -1 });
res.json(todos);
} catch (err) {
res.status(500).json({ message: err.message });
}
});


// Create new todo
app.post('/api/todos', async (req, res) => {
try {
const { text } = req.body;
if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });
const todo = new Todo({ text: text.trim() });
await todo.save();
res.status(201).json(todo);
} catch (err) {
res.status(500).json({ message: err.message });
}
});


// Update todo (toggle or text)
app.put('/api/todos/:id', async (req, res) => {
try {
const { id } = req.params;
const updates = req.body;
const todo = await Todo.findByIdAndUpdate(id, updates, { new: true });
if (!todo) return res.status(404).json({ message: 'Todo not found' });
res.json(todo);
} catch (err) {
res.status(500).json({ message: err.message });
}
});


// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
try {
const { id } = req.params;
const todo = await Todo.findByIdAndDelete(id);
if (!todo) return res.status(404).json({ message: 'Todo not found' });
res.json({ message: 'Deleted' });
} catch (err) {
res.status(500).json({ message: err.message });
}
});


// Serve frontend build (optional for production)
app.use(express.static(path.join(__dirname, 'frontend')));


app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
