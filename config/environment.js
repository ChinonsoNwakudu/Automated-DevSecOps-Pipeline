// config/environments.js

const environments = {
  development: {
    port: 3000,
    nodeEnv: 'development',
    logLevel: 'debug',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'todo_dev'
    },
    cors: {
      origin: '*'  // Allows all origins in dev
    }
  },
  
  staging: {
    port: process.env.PORT || 3000,
    nodeEnv: 'staging',
    logLevel: 'info',
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: 'todo_staging'
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || []
    },
    features: {
      rateLimiting: true,
      monitoring: true
    }
  },
  
  production: {
    port: process.env.PORT || 3000,
    nodeEnv: 'production',
    logLevel: 'warn',
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: 'todo_prod'
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || []
    },
    features: {
      rateLimiting: true,
      monitoring: true,
      caching: true
    },
    security: {
      helmet: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    }
  }
};

const currentEnv = process.env.NODE_ENV || 'development';

module.exports = environments[currentEnv];