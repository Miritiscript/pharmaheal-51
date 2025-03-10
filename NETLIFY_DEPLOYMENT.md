
# PharmaHeal Netlify Deployment Guide

This guide outlines the steps to deploy PharmaHeal to Netlify.

## Prerequisites

- A GitHub account with your PharmaHeal repository
- A Netlify account

## Deployment Steps

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

If your app uses Supabase or other API keys, add them as environment variables:

1. Go to Site settings → Environment variables
2. Add each environment variable used in your app:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - Any other variables your app requires

### 4. Deploy

1. Click "Deploy site"
2. Wait for the build process to complete
3. Once deployed, Netlify will provide a URL to access your site

### 5. Custom Domain (Optional)

1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to connect your custom domain

## Troubleshooting

- If you encounter build errors, check the build logs in Netlify
- For routing issues, ensure the netlify.toml file contains the correct redirects
- For environment variable issues, verify they are correctly set in Netlify settings

## Auto Deployments

With GitHub integration, any push to your main branch will automatically trigger a new deployment.

## Local Testing

To test the Netlify deployment locally:

1. Install Netlify CLI: `npm install netlify-cli -g`
2. Run: `netlify dev`

This allows you to test the site with Netlify's environment variables and redirects locally.
