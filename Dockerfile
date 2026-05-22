# ServiceOS Multi-stage Docker Build

# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Build applications
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Stage 3: API Runtime
FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY package.json ./
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]

# Stage 4: Web Runtime
FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY package.json ./
EXPOSE 3001
CMD ["node_modules/.bin/next", "start", "apps/web"]
