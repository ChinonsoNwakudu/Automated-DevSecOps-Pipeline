// tests/server.test.js
const request = require('supertest');
const app = require('../backend/server');

describe('Todo API Tests', () => {
  
  // Test the health check endpoint
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  // Test getting all todos
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Test creating a new todo
  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = { title: 'Test Todo' };
      const res = await request(app)
        .post('/api/todos')
        .send(newTodo);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Todo');
      expect(res.body.completed).toBe(false);
    });

    it('should return error when title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  // Test updating a todo
  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const res = await request(app)
        .put('/api/todos/1')
        .send({ completed: true });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .put('/api/todos/9999')
        .send({ completed: true });
      
      expect(res.statusCode).toBe(404);
    });
  });

  // Test deleting a todo
  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const res = await request(app).delete('/api/todos/1');
      expect(res.statusCode).toBe(204);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).delete('/api/todos/9999');
      expect(res.statusCode).toBe(404);
    });
  });
});

// Example of a unit test for a helper function
describe('Helper Functions', () => {
  it('should validate todo input', () => {
    const validateTodo = (title) => {
  
      return !!(title && typeof title === 'string' && title.length > 0);
     };
    expect(validateTodo('Valid title')).toBe(true);
    expect(validateTodo('')).toBe(false);
    expect(validateTodo(null)).toBe(false);
  });
});