# LifeGraph Backend - Production Dockerfile (Scoped for backend Root Directory)
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit

# Copy backend source code
COPY . ./

# Environment defaults
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start LifeGraph Game Server directly with Node
CMD ["node", "src/index.js"]
