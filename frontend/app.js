// frontend/app.js

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// State Management
let todos = [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const healthBadge = document.getElementById('health-badge');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  fetchTodos();
  setupEventListeners();
  setInterval(checkHealth, 30000); // Check health every 30 seconds
});

// Event Listeners
function setupEventListeners() {
  todoForm.addEventListener('submit', handleAddTodo);
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentFilter = e.target.dataset.filter;
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderTodos();
    });
  });
}

// API Functions
async function checkHealth() {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      healthBadge.innerHTML = `
        <span class="status-dot"></span>
        System Healthy
      `;
      healthBadge.style.background = '#d1fae5';
      healthBadge.style.color = '#065f46';
    }
  } catch (error) {
    healthBadge.innerHTML = `
      <span class="status-dot" style="background: #ef4444;"></span>
      System Offline
    `;
    healthBadge.style.background = '#fee2e2';
    healthBadge.style.color = '#991b1b';
  }
}

async function fetchTodos() {
  try {
    showLoading(true);
    hideError();
    
    const response = await fetch(`${API_URL}/todos`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    todos = await response.json();
    renderTodos();
    updateStats();
    showLoading(false);
    
  } catch (error) {
    console.error('Error fetching todos:', error);
    showError('Failed to load tasks. Please check your connection and try again.');
    showLoading(false);
  }
}

async function handleAddTodo(e) {
  e.preventDefault();
  
  const title = todoInput.value.trim();
  if (!title) return;
  
  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add todo');
    }
    
    const newTodo = await response.json();
    todos.push(newTodo);
    
    todoInput.value = '';
    renderTodos();
    updateStats();
    showToast('Task added successfully!', 'success');
    
  } catch (error) {
    console.error('Error adding todo:', error);
    showToast('Failed to add task', 'error');
  }
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    
    const updatedTodo = await response.json();
    todos = todos.map(t => t.id === id ? updatedTodo : t);
    
    renderTodos();
    updateStats();
    showToast('Task updated!', 'success');
    
  } catch (error) {
    console.error('Error updating todo:', error);
    showToast('Failed to update task', 'error');
  }
}

async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    
    todos = todos.filter(t => t.id !== id);
    
    renderTodos();
    updateStats();
    showToast('Task deleted!', 'success');
    
  } catch (error) {
    console.error('Error deleting todo:', error);
    showToast('Failed to delete task', 'error');
  }
}

// Render Functions
function renderTodos() {
  const filteredTodos = getFilteredTodos();
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  todoList.innerHTML = filteredTodos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(${todo.id})"
      >
      <span class="todo-text">${escapeHtml(todo.title)}</span>
      <div class="todo-actions">
        <button class="icon-btn delete-btn" onclick="deleteTodo(${todo.id})" title="Delete">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </li>
  `).join('');
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter(t => !t.completed);
    case 'completed':
      return todos.filter(t => t.completed);
    default:
      return todos;
  }
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  document.getElementById('total-todos').textContent = total;
  document.getElementById('completed-todos').textContent = completed;
  document.getElementById('pending-todos').textContent = pending;
  document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

// UI Helper Functions
function showLoading(show) {
  loadingElement.style.display = show ? 'block' : 'none';
}

function showError(message) {
  document.getElementById('error-text').textContent = message;
  errorElement.style.display = 'block';
}

function hideError() {
  errorElement.style.display = 'none';
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally accessible
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;