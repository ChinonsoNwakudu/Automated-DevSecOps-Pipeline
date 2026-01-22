// backend/models/Todo.js

/**
 * Todo Model
 * Represents a todo item with validation and business logic
 */

class Todo {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.completed = data.completed || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate todo data
   * @param {Object} data - Todo data to validate
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    // Title validation
    if (!data.title) {
      errors.push('Title is required');
    } else if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Completed validation
    if (data.completed !== undefined && typeof data.completed !== 'boolean') {
      errors.push('Completed must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new todo instance from raw data
   * @param {Object} data - Raw todo data
   * @returns {Todo} - Todo instance
   */
  static create(data) {
    const validation = this.validate(data);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return new Todo({
      ...data,
      title: data.title.trim()
    });
  }

  /**
   * Update todo properties
   * @param {Object} updates - Properties to update
   */
  update(updates) {
    const validation = Todo.validate({ ...this, ...updates });
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    if (updates.title !== undefined) {
      this.title = updates.title.trim();
    }

    if (updates.completed !== undefined) {
      this.completed = updates.completed;
    }

    this.updatedAt = new Date();
  }

  /**
   * Convert todo to JSON-safe object
   * @returns {Object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Check if todo is overdue (example business logic)
   * @param {number} days - Number of days before considering overdue
   * @returns {boolean}
   */
  isOverdue(days = 7) {
    if (this.completed) return false;
    
    const daysSinceCreation = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > days;
  }

  /**
   * Get todo priority based on creation date (example)
   * @returns {string} - 'high' | 'medium' | 'low'
   */
  getPriority() {
    if (this.completed) return 'none';
    
    const daysSinceCreation = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation > 7) return 'high';
    if (daysSinceCreation > 3) return 'medium';
    return 'low';
  }
}

module.exports = Todo;