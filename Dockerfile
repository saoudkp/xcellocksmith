# ---- Frontend (React/Vite) ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (workspaces)
COPY package.json package-lock.json ./
COPY packages/ ./packages/

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js components.json ./

# Install only frontend deps (skip workspace CMS)
RUN npm install --ignore-scripts

RUN npm run build

# ---- Serve with Nginx ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
