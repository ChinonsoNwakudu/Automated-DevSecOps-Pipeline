// backend/routes/todos.js

const express = require('express');
const router = express.Router();


// In-memory storage (you can replace with database later)
let todos = [
  { id: 1, title: 'Set up CI/CD pipeline', completed: false, createdAt: new Date() },
  { id: 2, title: 'Add security scanning', completed: false, createdAt: new Date() },
  { id: 3, title: 'Deploy to production', completed: false, createdAt: new Date() }
];

let nextId = 4;

// GET /api/todos - Get all todos
router.get('/', (req, res) => {
  try {
    // Optional filtering
    const { completed } = req.query;
    
    let filteredTodos = todos;
    if (completed !== undefined) {
      filteredTodos = todos.filter(t => t.completed === (completed === 'true'));
    }
    
    res.json(filteredTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/todos/:id - Get single todo
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/todos - Create new todo
router.post('/', (req, res) => {
  try {
    const { title, completed = false } = req.body;
    
    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }
    
    const newTodo = {
      id: nextId++,
      title: title.trim(),
      completed: Boolean(completed),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    todos.push(newTodo);
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const { title, completed } = req.body;
    const todo = todos[todoIndex];
    
    // Validation
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid title' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
      }
      todo.title = title.trim();
    }
    
    if (completed !== undefined) {
      todo.completed = Boolean(completed);
    }
    
    todo.updatedAt = new Date();
    todos[todoIndex] = todo;
    
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todos.splice(todoIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/todos - Delete all completed todos
router.delete('/', (req, res) => {
  try {
    const beforeCount = todos.length;
    todos = todos.filter(t => !t.completed);
    const deletedCount = beforeCount - todos.length;
    
    res.json({ 
      message: `Deleted ${deletedCount} completed todos`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error deleting todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;