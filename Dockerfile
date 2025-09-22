# Multi-stage build for Outline with Chatbot on Railway
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

# Build the frontend (Vite) with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=2048" VITE_CJS_IGNORE_WARNING=true yarn vite build

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

# Create empty .env file to prevent MISSING_ENV_FILE error
RUN touch /app/.env && chown outline:outline /app/.env

USER outline

# Railway will set the PORT environment variable
EXPOSE 3000

# Railway expects the app to listen on the PORT environment variable
CMD ["dumb-init", "sh", "-c", "NODE_OPTIONS='--max-old-space-size=1024' yarn db:migrate && NODE_OPTIONS='--max-old-space-size=1024' node build/server/index.js --services=cron,collaboration,websockets,admin,web,worker"]