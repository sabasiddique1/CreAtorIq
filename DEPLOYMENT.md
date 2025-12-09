# Vercel Deployment Guide

## Overview
You need to deploy **TWO separate projects** on Vercel:
1. **Frontend (Web)** - Next.js app
2. **Backend (API)** - Express/GraphQL serverless function

---

## Step 1: Deploy Frontend (Web App)

### Project Settings:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build` (or `turbo run build`)
- **Output Directory**: `.next` (Next.js default)
- **Install Command**: `pnpm install`

### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
```

**Important**: Replace `your-api-project.vercel.app` with your actual API project URL after deploying the API.

---

## Step 2: Deploy Backend (API)

### Project Settings:
- **Framework Preset**: Other (or Node.js)
- **Root Directory**: `apps/api`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Environment Variables (REQUIRED):
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=08eeb60d053b254e9142e8001f7a7f4a5b10fd585aacc1c6e1f3bb468ff2530d6e9d1dcf112c9610d4964de4b44f9bfc0fc113a8f775413049b9f64331baf2bc
JWT_REFRESH_SECRET=11c37fd64a6dab97fcce8b171035acf47d865aeb3182b720618b0964146c78fdb47325c1a23c9b02a94c7f35483d110bf468bf0199a9a28df654993ee7341cfc
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyBMBdjQVsL-4_t67dawFePVPwtYmKb4myI
NODE_ENV=production
ALLOWED_ORIGINS=https://your-web-project.vercel.app
```

**Important**: 
- Replace `your-mongodb-connection-string` with your actual MongoDB Atlas connection string
- Replace `your-web-project.vercel.app` with your actual frontend URL after deploying

---

## Step 3: Update Frontend API URL

After the API is deployed:
1. Go to your **Web project** settings on Vercel
2. Update `NEXT_PUBLIC_API_URL` to your API project URL
3. Redeploy the web project

---

## Deployment Steps

### For Frontend:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import `sabasiddique1/CreAtorIq` from GitHub
4. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Next.js (auto-detected)
5. Add environment variable: `NEXT_PUBLIC_API_URL` (update after API deploys)
6. Click "Deploy"

### For API:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import `sabasiddique1/CreAtorIq` from GitHub (same repo, different project)
4. Configure:
   - **Root Directory**: `apps/api`
   - **Framework**: Other
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
5. Add ALL environment variables listed above
6. Click "Deploy"

---

## Vercel Configuration

The `vercel.json` file is already configured with:
- Function timeout: 30 seconds
- API route rewrites for `/api/*`, `/graphql`, and `/health`

---

## Post-Deployment Checklist

- [ ] API project deployed and accessible
- [ ] Frontend project deployed
- [ ] `NEXT_PUBLIC_API_URL` updated in frontend project
- [ ] Frontend redeployed with correct API URL
- [ ] Test login/register functionality
- [ ] Test GraphQL queries
- [ ] Verify MongoDB connection works
- [ ] Check Vercel function logs for errors

---

## Troubleshooting

### API Timeout Errors
- Check function logs in Vercel dashboard
- Ensure MongoDB connection string is correct
- Verify all environment variables are set

### CORS Errors
- Make sure `ALLOWED_ORIGINS` includes your frontend URL
- Check that `NEXT_PUBLIC_API_URL` matches your API project URL

### Build Errors
- Ensure `pnpm` is used (not npm)
- Check that all dependencies are installed
- Verify TypeScript compilation succeeds

---

## Quick Deploy Commands (Alternative)

If you have Vercel CLI installed:

```bash
# Deploy API
cd apps/api
vercel --prod

# Deploy Web
cd apps/web
vercel --prod
```

