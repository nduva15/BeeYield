# Configuration Files Guide

This document explains the various configuration files in the BeeYield project.

## Deployment Configuration

### Primary Deployment: Hostinger

The website **currently deploys to Hostinger** hosting via GitHub Actions.

**Configuration files:**
- `.github/workflows/deploy.yml` - Automated deployment workflow
- `.env.production` - Production environment variables
- `public/.htaccess` - Apache rewrite rules for SPA routing

**Deployment process:**
1. Push to `main` branch triggers GitHub Actions
2. Project builds with `npm run build`
3. Built files from `dist/` upload to Hostinger via SSH/SCP
4. Files are placed in `public_html/` directory

### Vercel Configuration (Legacy)

The `vercel.json` file exists for historical reasons or potential future Vercel deployment. 

**Status:** Currently **NOT USED** for production deployment.

**If you want to deploy to Vercel instead:**
1. Update GitHub Actions workflow or disable it
2. Connect repository to Vercel
3. Configure Vercel project settings
4. Update `VITE_APP_URL` in `.env.production`

## Configuration Files

### `.env.production`
Production environment variables used during build.

```env
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-key]
VITE_APP_URL=https://beeyield.com
VITE_API_URL=/api/v1
```

**Important:** 
- `VITE_APP_URL` must match your actual domain
- Currently set to `https://beeyield.com` for Hostinger deployment
- Variables prefixed with `VITE_` are exposed to the client

### `.env.example`
Template for local development environment variables.

Copy to `.env` for local development:
```bash
cp .env.example .env
```

### `vite.config.ts`
Vite build tool configuration.

Key settings:
- React plugin with SWC
- Path aliases (`@` → `./src`)
- Development server on port 8080
- API proxy configuration

### `vercel.json`
Vercel deployment configuration (currently unused).

Contains:
- API routes configuration
- Rewrite rules for SPA
- CORS headers

**Note:** This file remains for potential future use but does not affect current Hostinger deployment.

### `render.yaml`
Render.com deployment configuration (alternative deployment option).

Defines:
- Backend service (Python/FastAPI)
- Frontend service (static site)
- Environment variables

**Note:** Not currently used. Hostinger is the primary deployment target.

### `public/.htaccess`
Apache server configuration for Hostinger.

**Purpose:** Enables client-side routing for React Router.

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**What it does:**
- Enables URL rewriting
- Serves `index.html` for all non-file requests
- Allows routes like `/about`, `/contact` to work properly

**Important:** This file must be present in the production build.

### `package.json`
NPM package configuration and scripts.

Key scripts:
- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build locally

### `tsconfig.json`
TypeScript configuration.

Sets up:
- Compiler options
- Module resolution
- Path aliases
- Strict type checking

### `tailwind.config.ts`
Tailwind CSS configuration.

Configures:
- Content paths for class scanning
- Custom theme extensions
- Plugins

### `eslint.config.js`
ESLint configuration for code linting.

## Switching Deployment Targets

### To Deploy to Vercel

1. **Disable GitHub Actions deployment:**
   - Remove or disable `.github/workflows/deploy.yml`
   - Or change the branch trigger

2. **Connect to Vercel:**
   - Log into Vercel dashboard
   - Import GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set environment variables in Vercel:**
   - Add all `VITE_*` variables
   - Update `VITE_APP_URL` to Vercel URL

4. **Update `.env.production`:**
   ```env
   VITE_APP_URL=https://beeyield.vercel.app
   ```

5. **Deploy:**
   - Push to main branch
   - Vercel auto-deploys

6. **Configure custom domain (optional):**
   - Add `beeyield.com` in Vercel dashboard
   - Update DNS records as instructed

### To Deploy to Render.com

1. **Use `render.yaml` configuration**
2. **Connect GitHub repository to Render**
3. **Render auto-detects configuration**
4. **Set environment variables in Render dashboard**
5. **Deploy**

### Current Setup: Hostinger

**Pros:**
- Traditional shared hosting
- cPanel access
- Direct file access via SSH/FTP
- Cost-effective

**Cons:**
- Manual deployment setup
- Requires GitHub Actions configuration
- SSH credentials needed

## Security Considerations

### Environment Variables

**Never commit sensitive keys to git:**
- `.env` is in `.gitignore` (local development only)
- `.env.production` is committed but contains only public keys
- Sensitive keys are stored in GitHub Secrets

**GitHub Secrets required:**
- `HOSTINGER_HOST`
- `HOSTINGER_USERNAME`
- `HOSTINGER_PASSWORD`
- `HOSTINGER_PORT`
- `VITE_SUPABASE_URL` (can be public)
- `VITE_SUPABASE_ANON_KEY` (can be public, "anon" key is safe)
- `VITE_API_URL`

### CORS Configuration

API calls from the frontend need proper CORS setup:
- Backend must allow requests from `beeyield.com`
- Supabase automatically handles CORS for allowed origins

## Troubleshooting

### Build uses wrong environment variables

- Check `.env.production` is correct
- Ensure `VITE_` prefix on all client variables
- Rebuild: `npm run build`

### Routes don't work on production

- Verify `.htaccess` is in `dist/` after build
- Check it's deployed to server
- Ensure Apache `mod_rewrite` is enabled

### Assets not loading

- Check `VITE_APP_URL` matches actual domain
- Verify all assets are in `dist/assets/`
- Check browser console for 404 errors

### Deployment fails

- Check GitHub Actions logs
- Verify all secrets are set
- Test SSH connection manually
- Ensure `public_html/` exists on server

## References

- [Vite Configuration](https://vitejs.dev/config/)
- [Vercel Deployment](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Apache mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
