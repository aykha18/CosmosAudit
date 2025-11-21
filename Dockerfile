# Multi-stage build for CosmoAudit Web Application
# Node.js + React frontend with Express backend

# Stage 1: Build the React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-alpine

# Install serve for serving static files (optional, since we have Express)
RUN npm install -g serve

# Create app directory
WORKDIR /app

# Copy built React app from build stage
COPY --from=build /app/build ./build

# Copy backend code
COPY backend/ ./backend/

# Copy package files for backend dependencies
COPY package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]