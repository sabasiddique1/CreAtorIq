# MongoDB Atlas Setup & IP Whitelist Guide

## Your MongoDB Connection String
```
mongodb+srv://sabasiddiqdev_db_user:QlJ7zw7gQhmW0tE6@cluster0.f6vzvec.mongodb.net/?appName=Cluster0
```

**Credentials:**
- Username: `sabasiddiqdev_db_user`
- Password: `QlJ7zw7gQhmW0tE6`
- Cluster: `cluster0.f6vzvec.mongodb.net`

---

## How to Add IP Address to MongoDB Atlas Whitelist

### Step-by-Step Instructions:

1. **Log in to MongoDB Atlas**
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign in with your account

2. **Navigate to Network Access**
   - Click on your project/cluster
   - In the left sidebar, click **"Network Access"** (under Security section)
   - Or go directly to: [Network Access Page](https://cloud.mongodb.com/v2#/security/network/whitelist)

3. **Add IP Address**
   - Click the **"Add IP Address"** button (green button, top right)
   - You have two options:

   **Option A: Add Your Current IP (for local development)**
   - Click **"Add Current IP Address"** button
   - This automatically detects and adds your current IP
   - Click **"Confirm"**

   **Option B: Allow Access from Anywhere (for Vercel deployment)**
   - Click **"Add IP Address"**
   - Enter: `0.0.0.0/0` in the IP Address field
   - Add a comment: "Allow Vercel deployments"
   - Click **"Confirm"**
   - ⚠️ **Warning**: This allows access from anywhere. Only use this if you trust your connection string is secure.

   **Option C: Add Specific IPs**
   - Click **"Add IP Address"**
   - Enter your specific IP address (e.g., `192.168.1.1`)
   - Add a comment (optional)
   - Click **"Confirm"**

4. **Wait for Changes to Take Effect**
   - Changes usually take effect within 1-2 minutes
   - You'll see a green checkmark when the IP is whitelisted

---

## Recommended Setup for Vercel Deployment

**For Production (Vercel):**
- Add `0.0.0.0/0` to allow all IPs (Vercel uses dynamic IPs)
- Make sure your MongoDB password is strong
- Consider using MongoDB Atlas IP Access List with specific Vercel IP ranges (if available)

**For Local Development:**
- Add your current IP address
- Or use `0.0.0.0/0` if you're okay with less security

---

## Security Best Practices

1. ✅ Use a strong password (you already have one)
2. ✅ Enable MongoDB Atlas authentication
3. ✅ Use environment variables (never commit credentials)
4. ✅ Regularly rotate passwords
5. ⚠️ Consider restricting IP access to specific ranges when possible

---

## Testing Your Connection

After whitelisting your IP, test the connection:

```bash
# From your local machine
cd apps/api
pnpm dev
```

Check the console for connection success messages.

---

## For Vercel Deployment

When deploying to Vercel:
1. Add `MONGODB_URI` as an environment variable in Vercel dashboard
2. Use the full connection string: `mongodb+srv://sabasiddiqdev_db_user:QlJ7zw7gQhmW0tE6@cluster0.f6vzvec.mongodb.net/?appName=Cluster0`
3. Make sure `0.0.0.0/0` is whitelisted in MongoDB Atlas (or Vercel's IP ranges)

