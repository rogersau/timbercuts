# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable pnpm && corepack prepare pnpm@10.22.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application with base path set to root for self-hosting
RUN sed -i "s|base: '/timbercuts/'|base: '/'|" vite.config.ts && pnpm vite build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
