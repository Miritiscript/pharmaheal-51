
# PharmaHeal Netlify Deployment Guide

This guide outlines the steps to deploy PharmaHeal to Netlify and ensure continuous deployment.

## Prerequisites

- A GitHub account with your PharmaHeal repository
- A Netlify account

## Initial Deployment Setup

### 1. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/) and log in
2. Click "Add new site" → "Import an existing project"
3. Select GitHub as your Git provider
4. Authenticate with GitHub and select your PharmaHeal repository

### 2. Configure Build Settings

Netlify will auto-detect that this is a Vite project. Confirm these settings:

- Build command: `npm run build`
- Publish directory: `dist`

### 3. Environment Variables

If your app uses API keys, add them as environment variables:

1. Go to Site settings → Environment variables
2. Add each environment variable used in your app:
   - VITE_GOOGLE_API_KEY (if used)
   - Any other variables your app requires

### 4. Deploy

1. Click "Deploy site"
2. Wait for the build process to complete
3. Once deployed, Netlify will provide a URL to access your site

## Ensuring Continuous Deployment

### 1. Verify Auto-Deploy Settings

1. Go to your site in Netlify Dashboard
2. Navigate to Site settings → Build & deploy → Continuous deployment
3. Ensure "Auto publish" is set to ON
4. Verify the branch to deploy is set to your main branch (e.g., `main` or `master`)

### 2. Trigger Builds Manually When Needed

If you need to trigger a new build manually:

1. Go to the Deploys tab in your Netlify dashboard
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. This will force Netlify to rebuild your site with the latest code

### 3. Troubleshooting Deployment Issues

If your changes aren't appearing after deployment:

1. **Check build logs** - Look for any errors in the Netlify build logs
2. **Clear browser cache** - Use Ctrl+F5 or Cmd+Shift+R to reload without cache
3. **Verify build settings** - Ensure the correct branch is being deployed
4. **Check for build hooks** - Ensure any build hooks are properly configured

### 4. Testing Locally Before Deployment

To test your Netlify deployment locally:

1. Install Netlify CLI: `npm install netlify-cli -g`
2. Run: `netlify dev`
3. This simulates the Netlify environment locally

## Best Practices for Smooth Deployments

1. **Use meaningful commit messages** - This helps track changes in the Netlify deploy logs
2. **Test locally before pushing** - Reduce failed builds by testing locally
3. **Set up branch previews** - Enable deploy previews for pull requests
4. **Monitor your builds** - Set up notifications for failed builds
5. **Use deployment contexts** - Configure different settings for production vs. development

Remember that each push to your configured branch will trigger a new build on Netlify automatically.
