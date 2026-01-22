// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// In-memory database (for learning purposes)
let todos = [
  { id: 1, title: 'Learn CI/CD', completed: false },
  { id: 2, title: 'Build Pipeline', completed: false }
];

// Routes
// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// POST create new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: todos.length + 1,
    title,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  
  if (req.body.title !== undefined) todo.title = req.body.title;
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  
  res.json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  
  todos.splice(index, 1);
  res.status(204).send();
});

// Health check endpoint (important for DevOps!)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Start server
// Only start server if run directly (not when imported by tests)
if (require.main === module) {
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}
// Export for testing
module.exports = app;