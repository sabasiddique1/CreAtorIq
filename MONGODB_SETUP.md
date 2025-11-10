# MongoDB Connection Setup Guide

This guide will help you connect MongoDB to your Engagement Nexus application.

## Option 1: Local MongoDB (Recommended for Development)

### Step 1: Install MongoDB Locally

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or check the service status
brew services list  # macOS
sudo systemctl status mongodb  # Linux
```

### Step 3: Create Environment File

Create a `.env` file in `apps/api/` directory:

```bash
cd apps/api
touch .env
```

Add the following content:

```env
# MongoDB Connection (Local)
MONGODB_URI=mongodb://localhost:27017/engagement-nexus

# JWT Secrets
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Server Port
PORT=3001

# OpenAI API Key (Optional - for AI features)
# OPENAI_API_KEY=sk-your-key-here
```

### Step 4: Update Server to Load dotenv

The server needs to load environment variables. Update `apps/api/src/server.ts` to import dotenv at the top:

```typescript
import 'dotenv/config'
// ... rest of imports
```

---

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier: M0)

### Step 2: Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Create a user with username and password
3. Set user privileges to "Read and write to any database"

### Step 3: Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. For production, add only your server's IP addresses

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Update Environment File

Update `apps/api/.env` with your Atlas connection string:

```env
# MongoDB Connection (Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/engagement-nexus?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Server Port
PORT=3001

# OpenAI API Key (Optional)
# OPENAI_API_KEY=sk-your-key-here
```

**Important:** Replace `<username>` and `<password>` with your actual database user credentials.

---

## Step 6: Configure dotenv in Server

Make sure `dotenv` is loaded. Update `apps/api/src/server.ts`:

```typescript
import 'dotenv/config'  // Add this at the very top
import express, { type Express } from "express"
// ... rest of imports
```

---

## Step 7: Test the Connection

1. Start the API server:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. You should see:
   ```
   MongoDB connected successfully
   Server running on http://localhost:3001
   GraphQL endpoint: http://localhost:3001/graphql
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

---

## Troubleshooting

### Error: "MongoDB connection failed"

**Local MongoDB:**
- Check if MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongodb` (Linux)
- Verify the connection string format
- Check MongoDB logs: `/usr/local/var/log/mongodb/mongo.log` (macOS)

**MongoDB Atlas:**
- Verify your IP address is whitelisted
- Check username/password are correct
- Ensure the connection string includes the database name: `...mongodb.net/engagement-nexus?...`
- Check Atlas cluster status in the dashboard

### Error: "Authentication failed"

- Verify database user credentials
- Check if the user has proper permissions
- For Atlas, ensure IP whitelist includes your current IP

### Connection Timeout

- Check firewall settings
- Verify network connectivity
- For Atlas, ensure your IP is whitelisted

---

## Quick Start (Local MongoDB)

If you have MongoDB installed locally, you can quickly set up:

```bash
# 1. Create .env file
cat > apps/api/.env << EOF
MONGODB_URI=mongodb://localhost:27017/engagement-nexus
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key
ALLOWED_ORIGINS=http://localhost:3000
PORT=3001
EOF

# 2. Update server.ts to load dotenv (if not already)
# Add: import 'dotenv/config' at the top

# 3. Start MongoDB (if not running)
brew services start mongodb-community  # macOS
# OR
sudo systemctl start mongodb  # Linux

# 4. Start the API server
cd apps/api
pnpm dev
```

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/engagement-nexus` | No (has default) |
| `JWT_SECRET` | Secret for JWT access tokens | `dev-secret-key-change-in-production` | No (has default) |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens | `dev-refresh-secret-key` | No (has default) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` | No (has default) |
| `PORT` | API server port | `3001` | No (has default) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | None | No (optional) |

---

## Next Steps

Once MongoDB is connected:
1. The API server will automatically create the database and collections
2. You can test registration/login via GraphQL
3. Check MongoDB to see created collections:
   ```bash
   mongosh engagement-nexus
   show collections
   ```

