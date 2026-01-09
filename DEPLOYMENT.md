# BeeYield Deployment Guide

## Vercel Deployment

This project is configured to deploy to Vercel automatically through GitHub integration.

### Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure this repository is connected to your Vercel account

### Setup Instructions

#### 1. Connect Repository to Vercel

1. Log in to your Vercel dashboard
2. Click "Add New Project"
3. Import this repository from GitHub
4. Vercel will automatically detect the Vite configuration

#### 2. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

**Required for Frontend:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Your backend API URL (Vercel serverless function URL)

**Required for Backend API (if using):**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `CLICKHOUSE_HOST`: ClickHouse database host
- `CLICKHOUSE_USER`: ClickHouse database user  
- `CLICKHOUSE_PASSWORD`: ClickHouse database password
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `JWT_SECRET`: Secret key for JWT token generation

#### 3. Build Configuration

The project is already configured with the correct build settings in `vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### 4. Deploy

Once connected, Vercel will automatically:
- Deploy on every push to the `main` branch
- Create preview deployments for pull requests
- Build the frontend using `npm run build`
- Serve the built assets from the `dist` directory

### Backend API Routes

The backend Python API is configured to run as Vercel Serverless Functions:
- API routes are defined in `api/index.py`
- They will be accessible at `https://your-domain.vercel.app/api/*`

### Troubleshooting

#### Build Failures

If builds fail:
1. Check that all environment variables are set correctly
2. Ensure `package.json` dependencies are up to date
3. Review build logs in Vercel dashboard for specific errors

#### API Route Issues

If API routes don't work:
1. Verify Python dependencies are listed in `api/requirements.txt`
2. Check that the Vercel runtime can access all necessary packages
3. Review serverless function logs in Vercel dashboard

### Manual Deployment

To deploy manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Local Development

To test locally:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- The `dist` folder is excluded from version control (added to `.gitignore`)
- Vercel automatically builds on each push, so there's no need to commit build artifacts
- The previous Hostinger deployment workflow has been removed as Vercel handles deployments natively
