# 🚀 Deployment Guide for Exposed

## Vercel Deployment (Dashboard)

### Prerequisites

- GitHub account with push access to https://github.com/Ns81000/Exposed
- Vercel account (sign up at https://vercel.com)

### Step 1: Push to GitHub

```bash
cd c:\Users\Ns8pc\Music\Exposed

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Exposed surveillance intelligence platform"

# Push to GitHub
git push -u origin main
# Note: You may need to create the 'main' branch on GitHub first
# or use 'git push origin master' if using master
```

### Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for "Ns81000/Exposed"
4. Click "Import"

### Step 3: Configure Project Settings

Vercel should automatically detect the configuration from `vercel.json`:

- **Framework**: React
- **Build Command**: `cd dashboard && pnpm install && pnpm build`
- **Output Directory**: `dashboard/dist`
- **Install Command**: `pnpm install`

If not auto-detected:

1. Go to **Project Settings**
2. Under **Build & Development Settings**:
   - **Build Command**: `cd dashboard && pnpm install && pnpm build`
   - **Output Directory**: `dashboard/dist`
   - **Node Version**: 18.x or 20.x
3. Click **Save**

### Step 4: Deploy

Click **Deploy** and wait for the build to complete (should take ~2-3 minutes).

Once complete, you'll get a live URL like: `https://exposed-xxx.vercel.app`

---

## Post-Deployment

### Verify Deployment

1. Visit the Vercel deployment URL
2. You should see the Exposed landing page
3. Click "Open Dashboard" to ensure routing works (will show mobile gate if detected desktop → go to desktop)

### Monitor Performance

- Check Vercel Analytics dashboard for performance metrics
- Monitor error logs via **Deployments** → **Settings** → **Analytics**

### Enable Preview Deployments

1. Go to **Project Settings**
2. Under **Vercel Analytics**, enable **Web Analytics**
3. Enable **Real Experience Score** to monitor performance

---

## Chrome Web Store Deployment (Extension)

### Step 1: Prepare for Submission

1. Create a developer account at https://chrome.google.com/webstore/category/extensions
2. Pay the one-time fee ($5 USD)

### Step 2: Package the Extension

```bash
# From project root
cd extension

# Create a ZIP file containing all extension files
# On Windows (in PowerShell):
Compress-Archive -Path .\* -DestinationPath ..\exposed-extension.zip -Force

# On macOS/Linux
zip -r ../exposed-extension.zip ./
```

### Step 3: Submit to Chrome Web Store

1. Visit https://chrome.google.com/webstore/devconsole
2. Click **Create new item**
3. Upload the `exposed-extension.zip`
4. Fill out the store listing:
   - **Name**: Exposed
   - **Summary**: "Surveillance intelligence tool that reveals trackers on every website"
   - **Description**: Copy from the main README
   - **Category**: Privacy
   - **Screenshots**: 
     - 1280x800 showing the D3 graph
     - 1280x800 showing the timeline view
   - **Icon**: 128x128 PNG (use `extension/icons/icon128.png`)

5. Click **Submit for Review**
6. Google will review within 3-5 business days

---

## Continuous Deployment (Optional)

### Auto-Deploy on Push

Vercel automatically deploys on every push to the linked GitHub repository:

1. **Push to `main`** → Deploy to production
2. **Push to any PR branch** → Deploy preview URL (commented on PR)
3. **Merge PR to main** → Automatic production deploy

No additional setup needed!

---

## Rollback

If something goes wrong:

### On Vercel

1. Go to **Deployments**
2. Find the previous successful deployment
3. Click **Promote to Production**

### On GitHub

```bash
# Find the commit hash of the version you want
git log --oneline

# Revert to that commit
git revert <commit-hash>

# Push to trigger a new Vercel deployment
git push origin main
```

---

## Troubleshooting

### Build Fails on Vercel

**Common issues:**

1. **Missing dependencies**
   ```
   Error: pnpm: command not found
   ```
   → Update `vercel.json` to install pnpm first:
   ```json
   "installCommand": "npm install -g pnpm && pnpm install"
   ```

2. **Build timeout**
   → Check logs for hanging commands. May need to increase timeout in vercel.json

3. **Environment variables not set**
   → Go to **Project Settings** → **Environment Variables** → Add required vars

### Dashboard Not Loading

1. Check the deployment logs: **Deployments** → **View Details**
2. Open browser DevTools Console (F12) for error messages
3. Check if Chrome extension is blocking requests
4. Verify the routing is working: 
   - `/` should show landing
   - `/dashboard` should show dashboard (or mobile gate)

### Extension Not Connecting to Dashboard

1. **Ensure extension is loaded** as unpacked in chrome://extensions
2. **Check extension permissions** in manifest.json include storage + webRequest
3. **Verify messaging** — check browser console for connection errors
4. **Clear IndexedDB** if data looks stale: Right-click page → Inspect → Application → Clear storage

---

## Performance Optimization

### Dashboard (Vercel)

Already optimized via Vite:
- Tree-shaking removes unused code
- Code splitting for route components
- CSS minification via PostCSS
- Asset optimization

**Current metrics:**
- Initial load: ~350KB JS (gzipped: ~117KB)
- CSS: ~12.67KB gzipped
- D3 graph loads only when needed

### Extension

Keep extension bundle small:
- ~150KB total (before compression)
- Only essential dependencies
- Lazy-load tracker database (only parse on-demand)

---

## Monitoring & Logging

### Vercel Monitoring

- **Function Execution**: Monitor edge functions (if using serverless functions)
- **Error Tracking**: Automatic error reporting via Sentry integration
- **Performance**: Web Vitals tracked automatically

### Extension Logging

Add debug logging to extension:

```javascript
// In background.js
console.log('[Exposed Extension] Tracker detected:', tracker);

// Check via chrome://extensions → [Exposed] → Service Worker
```

---

## Updating After Deployment

### Dashboard Updates

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update dashboard: [feature description]"
   git push origin main
   ```
3. Vercel automatically deploys (takes ~2-3 minutes)
4. Visit deployment URL to verify

### Extension Updates

1. Make changes locally
2. Extension auto-reloads in chrome://extensions (Developer mode)
3. Once ready, bump version in `extension/manifest.json`
4. Commit and push
5. Create a new ZIP and resubmit to Chrome Web Store
6. Google reviews the update (~1-3 days)

---

## Security Checklist

Before production deployment:

- [ ] Remove all `console.log` statements (or wrap in `if (DEBUG)`)
- [ ] Verify no API keys or secrets in code
- [ ] Check `.env.local` is in `.gitignore`
- [ ] Ensure Content Security Policy headers are correct
- [ ] Test extension permissions (no over-requesting)
- [ ] Verify IndexedDB privacy (local storage only)
- [ ] Review manifest.json for minimal required permissions
- [ ] Test on multiple Chrome versions
- [ ] Validate tracker database is current

---

## Support

For deployment issues:

- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/Ns81000/Exposed/issues
- **Chrome Web Store Help**: https://support.google.com/chrome_webstore

---

**Last Updated**: March 20, 2026
**Status**: Ready for Production ✅
