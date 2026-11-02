# LifeGraph Backend - Production Dockerfile (Scoped for backend Root Directory)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY . ./

# Environment defaults
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start LifeGraph Game Server
CMD ["npm", "start"]
