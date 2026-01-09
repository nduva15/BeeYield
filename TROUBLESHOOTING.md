# BeeYield Website Troubleshooting Guide

This guide helps diagnose and fix issues with https://beeyield.com/

## Quick Diagnosis Checklist

Run through this checklist to identify the issue:

- [ ] **DNS Check**: Can you resolve beeyield.com?
  ```bash
  nslookup beeyield.com
  # Should return an IP address
  ```

- [ ] **Hosting Check**: Is the domain connected to Hostinger?
  - Log into Hostinger control panel
  - Check if beeyield.com is listed in your domains

- [ ] **Deployment Check**: Has the site been deployed?
  - Check GitHub Actions for successful deployment runs
  - Look at the latest workflow run status

- [ ] **Files Check**: Are the files on the server?
  - SSH into Hostinger: `ssh username@hostname`
  - Check files: `ls -la public_html/`
  - Verify index.html exists: `ls -la public_html/index.html`

- [ ] **SSL Check**: Is HTTPS working?
  - Check if SSL certificate is installed in Hostinger
  - Try accessing both http and https versions

## Common Issues and Solutions

### 1. Domain Not Resolving (ERR_NAME_NOT_RESOLVED)

**Symptoms:**
- Browser shows "This site can't be reached"
- DNS lookup fails
- `nslookup beeyield.com` returns error

**Causes:**
- Domain not registered
- DNS not configured
- DNS not propagated yet

**Solutions:**

#### A. Check Domain Registration
1. Go to your domain registrar (where you bought the domain)
2. Verify the domain is active and not expired
3. Check the domain's expiration date

#### B. Configure DNS
1. Log into your domain registrar account
2. Go to DNS management
3. Option 1 - Use Hostinger Nameservers:
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ```
4. Option 2 - Add A Record:
   - Type: A
   - Name: @ (or leave blank for root domain)
   - Value: [Your Hostinger Server IP]
   - TTL: 3600 (or default)
   
   Also add for www:
   - Type: A
   - Name: www
   - Value: [Your Hostinger Server IP]
   - TTL: 3600

#### C. Wait for Propagation
DNS changes take time to propagate:
- Typical time: 15 minutes to 4 hours
- Maximum time: Up to 48 hours

Check propagation status:
```bash
# Check multiple DNS servers
nslookup beeyield.com 8.8.8.8  # Google DNS
nslookup beeyield.com 1.1.1.1  # Cloudflare DNS
```

Or use online tools:
- https://dnschecker.org/
- https://www.whatsmydns.net/

### 2. Domain Resolves but Shows 404 Error

**Symptoms:**
- DNS resolves correctly
- Browser shows "404 Not Found"
- Site loads but shows error page

**Causes:**
- Files not deployed to correct location
- .htaccess file missing or incorrect
- Wrong document root

**Solutions:**

#### A. Verify File Location
SSH into your Hostinger server:
```bash
ssh username@hostname
cd public_html
ls -la
```

You should see:
- `index.html`
- `assets/` directory
- `.htaccess` file
- Other asset files

#### B. Check .htaccess
Verify .htaccess exists and is correct:
```bash
cat public_html/.htaccess
```

Should contain:
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

#### C. Check Document Root
In Hostinger control panel:
1. Go to hosting settings
2. Verify document root is set to `public_html`
3. Make sure the domain points to the correct directory

### 3. Blank Page or JavaScript Errors

**Symptoms:**
- Page loads but shows blank/white page
- Browser console shows JavaScript errors
- React app doesn't initialize

**Causes:**
- Environment variables missing
- Build issues
- CORS problems
- Asset loading failures

**Solutions:**

#### A. Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages

Common errors:
- "Failed to fetch" → API connection issue
- "Unexpected token '<'" → Missing file, serving HTML instead
- "CORS error" → Backend CORS configuration issue

#### B. Verify Environment Variables
The build needs correct environment variables. Check `.env.production`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://beeyield.com
VITE_API_URL=/api/v1
```

Rebuild with correct variables:
```bash
npm run build
```

#### C. Test Build Locally
```bash
npm run build
npm run preview
```

Visit http://localhost:4173 to test the build.

### 4. Deployment Fails in GitHub Actions

**Symptoms:**
- GitHub Actions workflow fails
- Red X on commits
- Deployment doesn't complete

**Causes:**
- Missing GitHub Secrets
- Wrong SSH credentials
- Hostinger SSH disabled
- Network/firewall issues

**Solutions:**

#### A. Check GitHub Secrets
Go to: Repository → Settings → Secrets and variables → Actions

Verify all secrets are set:
- `HOSTINGER_HOST`
- `HOSTINGER_USERNAME`
- `HOSTINGER_PASSWORD`
- `HOSTINGER_PORT` (usually 22)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

#### B. Test SSH Access
Try connecting manually:
```bash
ssh username@hostname
```

If this fails:
1. Enable SSH in Hostinger control panel
2. Check username and password
3. Verify port number (usually 22)

#### C. Check Workflow Logs
1. Go to Actions tab in GitHub
2. Click on failed workflow run
3. Expand each step to see detailed errors
4. Look for specific error messages

Common errors:
- "Permission denied" → Wrong credentials
- "Connection refused" → SSH not enabled or wrong port
- "Host key verification failed" → Need to accept host key

### 5. SSL/HTTPS Issues

**Symptoms:**
- "Not Secure" warning
- Mixed content warnings
- Certificate errors

**Solutions:**

#### A. Install SSL Certificate
In Hostinger control panel:
1. Go to SSL certificates
2. Install Let's Encrypt SSL (free)
3. Wait for certificate installation (few minutes)

#### B. Force HTTPS
Add to .htaccess (before other rules):
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### C. Update Links
Ensure all internal links use relative paths or HTTPS.

### 6. Site Works on Desktop but Not Mobile

**Symptoms:**
- Desktop version loads fine
- Mobile shows errors or blank page

**Solutions:**
1. Clear mobile browser cache
2. Test in different mobile browsers
3. Check viewport meta tag in index.html
4. Test responsive design in DevTools

### 7. API Calls Failing

**Symptoms:**
- "Network error"
- "Failed to fetch"
- API features don't work

**Solutions:**

#### A. Check API URL
In .env.production:
```bash
VITE_API_URL=/api/v1
# or if backend is separate:
VITE_API_URL=https://api.beeyield.com
```

#### B. Verify Backend
- Is the backend deployed?
- Is it accessible?
- Test API endpoint directly

#### C. Check CORS
Backend must allow requests from beeyield.com.

## Emergency Rollback

If you deployed broken code:

1. Find last working commit:
   ```bash
   git log --oneline
   ```

2. Revert to working version:
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

3. Manually deploy working build:
   ```bash
   git checkout [working-commit]
   npm run build
   # Upload dist/ manually via Hostinger file manager or FTP
   ```

## Getting Help

### Information to Provide

When asking for help, include:

1. **Error Message**: Exact error from browser console or logs
2. **Steps to Reproduce**: What you did before the error
3. **Environment**: Browser, device, operating system
4. **Recent Changes**: What was changed recently
5. **Logs**: GitHub Actions logs, server logs, browser console

### Support Contacts

- **GitHub Actions Issues**: Check workflow logs
- **Hostinger Issues**: Contact Hostinger support
- **Code Issues**: Check GitHub repository issues
- **DNS Issues**: Contact domain registrar

## Verification Commands

Use these to verify everything is working:

```bash
# Check DNS
nslookup beeyield.com

# Check HTTP response
curl -I https://beeyield.com/

# Test SSL
curl -v https://beeyield.com/ 2>&1 | grep -i ssl

# Check if files are served
curl https://beeyield.com/ | grep "<title>"

# Test API endpoint
curl https://beeyield.com/api/v1/health
```

## Prevention

To avoid future issues:

1. **Test Before Deploying**
   ```bash
   npm run build
   npm run preview
   ```

2. **Use Staging Environment**
   - Test on a subdomain first
   - Deploy to production only after testing

3. **Monitor Uptime**
   - Use uptime monitoring service (e.g., UptimeRobot)
   - Set up alerts for downtime

4. **Keep Backups**
   - Download `public_html` regularly
   - Keep working versions in git tags

5. **Document Changes**
   - Write clear commit messages
   - Document configuration changes
   - Keep this guide updated
