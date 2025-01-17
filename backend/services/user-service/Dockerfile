FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and built assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set user for security
USER node

EXPOSE 3000

CMD ["npm", "run", "start:prod"]