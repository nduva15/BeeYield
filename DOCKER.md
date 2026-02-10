# BeeYield Docker Setup

This project uses Docker and Docker Compose for containerization.

## Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- At least 4GB RAM allocated to Docker

### Initial Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables in `.env`:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `DATABASE_URL`: PostgreSQL connection string (optional for external DB)

3. **Build and start services:**
   ```bash
   docker compose up -d --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Available Commands

### Using Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild services
docker compose up -d --build
```

### Using Makefile (if available)

```bash
# Start development environment
make dev

# Start production environment
make up

# View logs
make logs

# Stop everything
make down

# Clean up (removes volumes)
make clean
```

## Docker Files Overview

- **Dockerfile** - Frontend (React + Vite + Nginx)
- **backend/Dockerfile** - Backend (FastAPI + Python)
- **docker-compose.yml** - Production configuration
- **docker-compose.dev.yml** - Development with hot reload
- **.dockerignore** - Excludes unnecessary files from builds

## Services

### Frontend (Port 3000)
- **Technology:** React, Vite, TailwindCSS
- **Server:** Nginx
- **Features:** SPA routing, static asset caching, gzip compression

### Backend (Port 8000)
- **Technology:** FastAPI, Python 3.11
- **Features:** Auto-reload in dev mode, health checks, non-root user

### PostgreSQL (Port 5432)
- **Version:** 16 Alpine
- **Data:** Persisted in Docker volume

### Redis (Port 6379)
- **Version:** 7 Alpine
- **Persistence:** AOF enabled

## Development vs Production

### Development Mode
```bash
docker compose -f docker-compose.dev.yml up -d
```
- Hot reload enabled for frontend and backend
- Source code mounted as volumes
- Debug logging enabled

### Production Mode
```bash
docker compose up -d
```
- Optimized builds
- No source code mounting
- Production-ready configurations

## Best Practices Implemented

### Build Optimization
- ✅ Multi-stage builds to minimize image size
- ✅ Layer caching optimization
- ✅ Build cache mounts for dependencies
- ✅ Specific version tags (no `latest`)
- ✅ Combined RUN commands to reduce layers

### Security
- ✅ Non-root user in backend container
- ✅ Security headers in Nginx
- ✅ .dockerignore to exclude sensitive files
- ✅ No secrets in images (use environment variables)

### Performance
- ✅ Nginx gzip compression
- ✅ Static asset caching
- ✅ Redis persistence with AOF
- ✅ Health checks for all services

### Development Experience
- ✅ Hot reload for frontend and backend
- ✅ Named containers for easy identification
- ✅ Separate dev/prod configurations
- ✅ Volume mounts for development

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs <service-name>

# Check health status
docker compose ps
```

### Port conflicts
If ports 3000, 8000, 5432, or 6379 are in use:
- Modify port mappings in `docker-compose.yml`
- Or stop conflicting services

### Build failures
```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Database connection issues
- Ensure PostgreSQL is healthy: `docker compose ps`
- Check DATABASE_URL in .env
- Verify network connectivity: `docker network ls`

## Maintenance

### Backup Database
```bash
docker compose exec postgres pg_dump -U postgres beeyield > backup.sql
```

### Restore Database
```bash
docker compose exec -T postgres psql -U postgres -d beeyield < backup.sql
```

### Update Images
```bash
docker compose pull
docker compose up -d
```

### Clean Up
```bash
# Remove containers and networks
docker compose down

# Remove volumes too (WARNING: deletes data)
docker compose down -v

# Clean unused Docker resources
docker system prune -af --volumes
```

## Network Architecture

All services communicate through a dedicated bridge network:
- **Network name:** `beeyield-network`
- **Service discovery:** Use service names as hostnames
- **Example:** Backend connects to `postgres:5432`

## Volume Management

Persistent data is stored in named volumes:
- `postgres_data` - PostgreSQL database files
- `redis_data` - Redis persistence files

To inspect volumes:
```bash
docker volume ls
docker volume inspect honey_postgres_data
```

## Environment Variables

### Required
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase public key

### Optional
- `DATABASE_URL` - External database (if not using bundled Postgres)
- `POSTGRES_PASSWORD` - Local Postgres password (default: postgres)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Production Deployment

For production deployment:

1. Set production environment variables in `.env`
2. Use `docker compose up -d` (not dev compose)
3. Configure reverse proxy (nginx/Caddy) for SSL
4. Set up monitoring and logging
5. Implement backup strategy
6. Consider using orchestration (Kubernetes, ECS)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
