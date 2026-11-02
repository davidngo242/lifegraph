# LifeGraph Backend - Production Dockerfile (Root context)
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit

# Copy backend source code
COPY backend/ ./

# Environment defaults
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start LifeGraph Game Server directly with Node
CMD ["node", "src/index.js"]
