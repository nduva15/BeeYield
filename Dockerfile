# Multi-stage build for BeeYield Frontend
FROM node:20-alpine AS deps

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN pnpm run build

# Production stage with nginx
FROM nginx:1.27-alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration file
RUN echo 'server { \n\
    listen 80; \n\
    server_name _; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    # Enable gzip compression \n\
    gzip on; \n\
    gzip_vary on; \n\
    gzip_min_length 1024; \n\
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json; \n\
    \n\
    # Security headers \n\
    add_header X-Frame-Options "SAMEORIGIN" always; \n\
    add_header X-Content-Type-Options "nosniff" always; \n\
    add_header X-XSS-Protection "1; mode=block" always; \n\
    \n\
    # SPA routing \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
    \n\
    # Cache static assets \n\
    location ~* \\.(?:css|js|jpg|jpeg|gif|png|svg|ico|woff|woff2|ttf|eot)$ { \n\
        expires 1y; \n\
        add_header Cache-Control "public, immutable"; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
