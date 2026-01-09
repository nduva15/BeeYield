# BeeYield Deployment Guide

This guide explains how to deploy the BeeYield website to make https://beeyield.com/ work.

## Current Status

The website is configured to deploy to **Hostinger** hosting via GitHub Actions.

## Prerequisites

### 1. Domain Configuration

The domain `beeyield.com` must be:
- **Registered** with a domain registrar (e.g., GoDaddy, Namecheap, Google Domains)
- **DNS Configured** to point to your Hostinger hosting account

#### DNS Configuration Steps:

1. Log into your domain registrar account
2. Find the DNS management section
3. Update the nameservers to point to Hostinger:
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ```
   OR configure A records to point to your Hostinger server IP

4. Wait for DNS propagation (can take up to 48 hours, usually much faster)

You can verify DNS propagation using:
```bash
nslookup beeyield.com
# or
dig beeyield.com
```

### 2. Hostinger Hosting Setup

Ensure you have:
- An active Hostinger hosting account
- SSH access enabled
- The domain `beeyield.com` added to your hosting account

### 3. GitHub Secrets Configuration

The deployment workflow requires the following secrets to be configured in your GitHub repository:

Go to: `Repository Settings → Secrets and variables → Actions → New repository secret`

Required secrets:
- `HOSTINGER_HOST`: Your Hostinger SSH hostname (e.g., `yourserver.hostinger.com`)
- `HOSTINGER_USERNAME`: Your Hostinger SSH username
- `HOSTINGER_PASSWORD`: Your Hostinger SSH password
- `HOSTINGER_PORT`: SSH port (usually `22`)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Your API URL (e.g., `/api/v1` or `https://api.beeyield.com`)

### 4. Hostinger File Structure

The deployment uploads files to the `public_html` directory on Hostinger. Make sure:
- The `public_html` directory exists
- You have write permissions to this directory
- The directory is configured as your domain's document root

## Deployment Process

### Automatic Deployment

The site automatically deploys when you push to the `main` branch:

```bash
git checkout main
git merge your-feature-branch
git push origin main
```

The GitHub Actions workflow will:
1. Install dependencies
2. Build the React application
3. Upload the built files to Hostinger via SSH/SCP

### Manual Deployment

To manually trigger deployment:

1. Go to GitHub Actions tab in your repository
2. Select "Deploy to beeyield.com" workflow
3. Click "Run workflow"
4. Select the `main` branch
5. Click "Run workflow"

### Local Build Test

To test if the build works locally before deploying:

```bash
# Install dependencies
npm ci --legacy-peer-deps

# Build the project
npm run build

# Preview the build
npm run preview
```

The built files will be in the `dist` directory.

## Troubleshooting

### Issue: Website shows 404 or doesn't load

**Solutions:**
1. Check if DNS is properly configured and propagated
2. Verify the files are in the correct directory (`public_html`) on Hostinger
3. Check `.htaccess` file is present for React Router to work
4. Ensure SSL certificate is installed on Hostinger

### Issue: Deployment fails in GitHub Actions

**Solutions:**
1. Check all GitHub Secrets are correctly configured
2. Verify Hostinger SSH credentials
3. Check the Actions log for specific error messages
4. Ensure Hostinger SSH access is enabled

### Issue: Site loads but shows blank page

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify environment variables (Supabase credentials) are correct
3. Check if the build completed successfully
4. Ensure all assets are accessible (no CORS issues)

### Issue: API calls fail

**Solutions:**
1. Verify `VITE_API_URL` is correctly configured
2. Check Supabase credentials
3. Ensure backend API is deployed and accessible
4. Check CORS configuration on the backend

## Verifying Deployment

After deployment, verify the site is working:

1. Visit https://beeyield.com/ in your browser
2. Check that all pages load correctly
3. Test the traceability feature
4. Verify the contact form works
5. Check that images and assets load

## Current Deployment Configuration

The deployment is configured in:
- **Workflow File**: `.github/workflows/deploy.yml`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Target**: Hostinger `public_html` via SSH/SCP

## Additional Resources

- [Hostinger Knowledge Base](https://support.hostinger.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

## Support

If you continue to experience issues:
1. Check the GitHub Actions logs for detailed error messages
2. Contact Hostinger support for server-side issues
3. Review the browser console for client-side errors
