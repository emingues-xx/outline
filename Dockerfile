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

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy ALL source code (including your chatbot modifications)
COPY . .

# Build the application
RUN yarn build:server

# Build the frontend (Vite)
RUN VITE_CJS_IGNORE_WARNING=true yarn vite build

# Production stage
FROM node:20-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
  dumb-init \
  && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r outline && useradd -r -g outline outline

WORKDIR /app

# Copy built application (including your chatbot)
COPY --from=base --chown=outline:outline /app/build ./build
COPY --from=base --chown=outline:outline /app/package.json ./package.json
COPY --from=base --chown=outline:outline /app/yarn.lock ./yarn.lock

# Copy frontend build files
COPY --from=base --chown=outline:outline /app/app/.vite ./app/.vite

# Install production dependencies only
RUN yarn install --frozen-lockfile --production=true && \
  yarn cache clean

# Copy static files
COPY --chown=outline:outline public ./public
COPY --chown=outline:outline server/static ./server/static

# Create data directory and set permissions
RUN mkdir -p /app/data && \
  chown -R outline:outline /app/data

USER outline

# Railway will set the PORT environment variable
EXPOSE 3000

# Railway expects the app to listen on the PORT environment variable
CMD ["dumb-init", "node", "build/server/index.js", "--services=cron,collaboration,websockets,admin,web,worker"]