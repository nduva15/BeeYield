# Multi-stage build for BeeYield Frontend
FROM node:20-alpine AS deps

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables (CRITICAL FOR AUTH)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_URL_SHOP
ARG VITE_SUPABASE_ANON_KEY_SHOP
ARG VITE_SUPABASE_URL_BEEYIELD
ARG VITE_SUPABASE_ANON_KEY_BEEYIELD
ARG VITE_SUPABASE_URL_CEBA
ARG VITE_SUPABASE_ANON_KEY_CEBA
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_STRIPE_API_URL
ARG VITE_SUPER_ADMIN_EMAIL

# Build environment - MUST match VITE_ prefix to be available in browser
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_SUPABASE_URL_SHOP=${VITE_SUPABASE_URL_SHOP}
ENV VITE_SUPABASE_ANON_KEY_SHOP=${VITE_SUPABASE_ANON_KEY_SHOP}
ENV VITE_SUPABASE_URL_BEEYIELD=${VITE_SUPABASE_URL_BEEYIELD}
ENV VITE_SUPABASE_ANON_KEY_BEEYIELD=${VITE_SUPABASE_ANON_KEY_BEEYIELD}
ENV VITE_SUPABASE_URL_CEBA=${VITE_SUPABASE_URL_CEBA}
ENV VITE_SUPABASE_ANON_KEY_CEBA=${VITE_SUPABASE_ANON_KEY_CEBA}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
ENV VITE_STRIPE_API_URL=${VITE_STRIPE_API_URL}
ENV VITE_SUPER_ADMIN_EMAIL=${VITE_SUPER_ADMIN_EMAIL}

# Build the application
RUN pnpm run build

# Production stage with nginx
FROM nginx:1.27-alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration file with proper auth headers and caching
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    client_max_body_size 10M; \
    \
    # Enable gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    \
    # SPA routing for auth callback \
    location / { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Auth callback path - no cache \
    location /auth/callback { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # API proxy with dynamic resolution (bypasses nginx -t build-time host lookup) \
    location /api/ { \
        resolver 127.0.0.11 valid=30s ipv6=off; \
        set $backend_upstream http://backend:8000; \
        rewrite ^/api/(.*) /$1 break; \
        proxy_pass $backend_upstream; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_buffering off; \
    } \
    \
    # Cache static assets (long-term) \
    location ~* \.(?:css|js|jpg|jpeg|gif|png|svg|ico|woff|woff2|ttf|eot)$ { \
        expires 30d; \
        add_header Cache-Control "public, immutable, max-age=2592000" always; \
    } \
    \
    # Disable caching for service worker and manifest \
    location ~* \.(?:sw\.js|manifest\.json)$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header Pragma "no-cache" always; \
        add_header Expires "0" always; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Validate nginx config
RUN nginx -t

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
