FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (excluding client directory)
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /usr/src/app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose the application port
EXPOSE 80

# Start the application
CMD ["node", "dist/main"]