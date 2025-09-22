# Multi-stage build for Outline with Chatbot on Railway - CACHE BUST $(date)
FROM node:20-slim AS base

# Install dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  git \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with memory optimization
RUN yarn install --frozen-lockfile --production=false --network-timeout 1000000

# Copy ALL source code (including your chatbot modifications)
COPY . .

# Build the application with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=2048" yarn build:server

# Debug: Check Vite availability before build
RUN echo "=== CACHE BUST: $(date) ===" && \
  echo "=== Checking if vite is available ===" && \
  yarn list vite || echo "Vite not found in yarn list" && \
  echo "=== Checking package.json scripts ===" && \
  cat package.json | grep -A 5 -B 5 "vite" || echo "No vite scripts found"

# Build the frontend (Vite) with memory optimization
RUN echo "=== Starting Vite build ===" && \
  NODE_OPTIONS="--max-old-space-size=2048" VITE_CJS_IGNORE_WARNING=true yarn vite build && \
  echo "=== Vite build completed ==="

# Debug: Check if Vite build generated the manifest
RUN echo "=== Checking Vite build output ===" && \
  ls -la /app/build/ && \
  ls -la /app/build/app/ && \
  ls -la /app/build/app/.vite/ && \
  cat /app/build/app/.vite/manifest.json | head -20 || echo "Manifest not found"

# Production stage
FROM node:20-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
  dumb-init \
  redis-tools \
  && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r outline && useradd -r -g outline outline

WORKDIR /app

# Copy built application (including your chatbot and frontend)
COPY --from=base --chown=outline:outline /app/build ./build
COPY --from=base --chown=outline:outline /app/package.json ./package.json
COPY --from=base --chown=outline:outline /app/yarn.lock ./yarn.lock

# Install production dependencies only with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=1024" yarn install --frozen-lockfile --production=true && \
  yarn cache clean

# Copy static files
COPY --chown=outline:outline public ./public
COPY --chown=outline:outline server/static ./server/static
COPY --chown=outline:outline shared ./shared

# Copy Sequelize configuration and migrations
COPY --chown=outline:outline .sequelizerc ./
COPY --chown=outline:outline server/config ./server/config
COPY --chown=outline:outline server/migrations ./server/migrations

# Create data directory and set permissions
RUN mkdir -p /app/data /var/lib/outline/data && \
  chown -R outline:outline /app/data /var/lib/outline/data

# Debug: List directory structure to verify shared folder
RUN echo "=== Checking shared directory structure ===" && \
  ls -la /app/shared/ && \
  ls -la /app/shared/i18n/ && \
  ls -la /app/shared/i18n/locales/ && \
  ls -la /app/shared/i18n/locales/pt_BR/ && \
  echo "=== Checking build directory structure ===" && \
  ls -la /app/build/server/routes/ && \
  echo "=== Checking if locales are accessible from routes ===" && \
  ls -la /app/build/server/routes/../../shared/i18n/locales/ || echo "Path not found"

# Fix locales path - create symlink or copy to expected location
RUN echo "=== Fixing locales path ===" && \
  mkdir -p /app/build/shared/i18n/locales && \
  cp -r /app/shared/i18n/locales/* /app/build/shared/i18n/locales/ && \
  echo "=== Verifying fixed structure ===" && \
  ls -la /app/build/shared/i18n/locales/ && \
  ls -la /app/build/shared/i18n/locales/pt_BR/

# Create empty .env file to prevent MISSING_ENV_FILE error
RUN touch /app/.env && chown outline:outline /app/.env

USER outline

# Railway will set the PORT environment variable
EXPOSE 3000

# Railway expects the app to listen on the PORT environment variable
CMD ["dumb-init", "sh", "-c", "NODE_OPTIONS='--max-old-space-size=1024' yarn db:migrate && NODE_OPTIONS='--max-old-space-size=1024' node build/server/index.js --services=cron,collaboration,websockets,admin,web,worker"]