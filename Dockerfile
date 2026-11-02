# LifeGraph Backend - Production Dockerfile for Render / Cloud Deploy
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Default environment configuration
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start LifeGraph Game Engine
CMD ["npm", "start"]
