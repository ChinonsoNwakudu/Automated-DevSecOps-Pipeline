# Dockerfile

# Stage 1: Base image with Node.js
FROM node:18-alpine AS base
# Alpine is a lightweight Linux distribution

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Development image (for local testing)
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Stage 3: Production image (final, optimized)
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Copy application code
COPY backend ./backend
COPY frontend ./frontend
COPY config ./config   

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of files
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (doesn't actually publish, just documents)
EXPOSE 3000

# Health check (Docker will ping this endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "backend/server.js"]