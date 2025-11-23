# Environment Variables Setup Guide

## 📋 Overview

This project requires environment variables to be set up in `.env` files for both the API and Web applications.

## 🔧 API Environment Variables (`apps/api/.env`)

### Required Variables

Create or update `apps/api/.env` with the following variables:

```bash
# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/creatoriq

# Option 2: MongoDB Atlas (Cloud)
# Get from: https://www.mongodb.com/cloud/atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creatoriq

# JWT Secrets (Generate strong random strings for production)
# Generate using: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-in-production

# Google Gemini AI API Key
# ⚠️ REQUIRED for AI features (sentiment analysis, idea generation)
# Get your API key from: https://aistudio.google.com/app/apikey
# Steps:
#   1. Go to https://aistudio.google.com/
#   2. Sign in with your Google account
#   3. Click "Get API Key" or visit https://aistudio.google.com/app/apikey
#   4. Create a new API key or use an existing one
#   5. Copy the API key and paste it below
GOOGLE_GENERATIVE_AI_API_KEY=your-google-gemini-api-key-here

# CORS Allowed Origins (comma-separated for multiple origins)
# For development
ALLOWED_ORIGINS=http://localhost:3000
# For production, add your domain:
# ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Server Port (optional, defaults to 3001)
PORT=3001

# Node Environment
NODE_ENV=development
```

### How to Get Each Variable

#### 1. **MONGODB_URI**
- **Local MongoDB**: 
  - Install MongoDB locally or use Docker
  - Default: `mongodb://localhost:27017/creatoriq`
  
- **MongoDB Atlas (Cloud)**:
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Sign up/Login
  3. Create a free cluster
  4. Click "Connect" → "Connect your application"
  5. Copy the connection string
  6. Replace `<password>` with your database password
  7. Replace `<database>` with `creatoriq`

#### 2. **JWT_SECRET & JWT_REFRESH_SECRET**
- Generate secure random strings:
  ```bash
  openssl rand -base64 32
  ```
- Or use an online generator: https://randomkeygen.com/
- **Important**: Use different values for production!

#### 3. **GOOGLE_GENERATIVE_AI_API_KEY** ⚠️ REQUIRED
- **Steps to get API key**:
  1. Visit https://aistudio.google.com/
  2. Sign in with your Google account
  3. Click on "Get API Key" or go directly to https://aistudio.google.com/app/apikey
  4. Click "Create API Key" → Select or create a Google Cloud project
  5. Copy the generated API key
  6. Paste it in your `.env` file

- **Current API Key** (if already set):
  - Check `apps/api/.env` file
  - Look for: `GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...`

#### 4. **ALLOWED_ORIGINS**
- For development: `http://localhost:3000`
- For production: Add your domain(s), comma-separated

## 🌐 Web Environment Variables (`apps/web/.env.local`)

Create `apps/web/.env.local` with:

```bash
# API URL - Backend GraphQL endpoint
# For development
NEXT_PUBLIC_API_URL=http://localhost:3001

# For production, change to your production API URL
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## ✅ Current Status

### Already Implemented ✅
- `.env` file exists at `apps/api/.env`
- MongoDB URI is configured
- JWT secrets are set (using dev defaults)
- CORS origins are configured

### Need to Check ⚠️
1. **GOOGLE_GENERATIVE_AI_API_KEY**: 
   - Check if it's set in `apps/api/.env`
   - If missing, follow steps above to get one

2. **Web `.env.local`**:
   - Check if `apps/web/.env.local` exists
   - If not, create it with `NEXT_PUBLIC_API_URL=http://localhost:3001`

## 🚀 Quick Setup

```bash
# 1. Copy example file (if .env doesn't exist)
cp apps/api/.env.example apps/api/.env

# 2. Edit the .env file with your values
# Add your MongoDB URI, JWT secrets, and Google Gemini API key

# 3. Create web .env.local (if needed)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local

# 4. Restart your dev servers
pnpm dev
```

## 🔒 Security Notes

- **Never commit `.env` files to git** (they're in `.gitignore`)
- Use strong, unique secrets for production
- Rotate API keys regularly
- Use environment-specific values (dev/staging/prod)

## 📝 Verification

To verify your environment variables are loaded:

```bash
# Check API .env
cd apps/api
cat .env | grep -v "^#" | grep -v "^$"

# Check Web .env.local
cd apps/web
cat .env.local 2>/dev/null || echo "File doesn't exist"
```

## 🆘 Troubleshooting

**Issue**: AI features not working
- **Solution**: Check if `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly

**Issue**: Can't connect to MongoDB
- **Solution**: Verify `MONGODB_URI` is correct and MongoDB is running

**Issue**: CORS errors
- **Solution**: Add your frontend URL to `ALLOWED_ORIGINS`

**Issue**: Authentication not working
- **Solution**: Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set

