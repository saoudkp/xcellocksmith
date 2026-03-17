# ---- CMS (Payload + Next.js) ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy CMS package files
COPY package.json package-lock.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Build Next.js + Payload
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]
