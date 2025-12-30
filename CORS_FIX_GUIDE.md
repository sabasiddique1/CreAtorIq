# CORS Error Fix Guide

## Issues Fixed in Code:
1. ✅ Removed trailing slash from API_BASE_URL to prevent `//graphql` double slash
2. ✅ Improved CORS middleware to handle preflight requests correctly
3. ✅ Added explicit OPTIONS handler for `/graphql` endpoint
4. ✅ Reordered middleware so CORS runs first

## Action Required: Update Vercel Environment Variables

### Step 1: Fix API Project Environment Variables

Go to your **API project** (`crreator-iq.vercel.app`) → Settings → Environment Variables:

**Update `ALLOWED_ORIGINS`:**
```
ALLOWED_ORIGINS=https://cre-ator-iq-web.vercel.app
```

**Important:** 
- Remove any trailing slashes
- Use exact URL (with `https://`)
- If you have multiple origins, separate with commas: `https://cre-ator-iq-web.vercel.app,https://another-domain.com`

### Step 2: Fix Web Project Environment Variables

Go to your **Web project** (`cre-ator-iq-web.vercel.app`) → Settings → Environment Variables:

**Update `NEXT_PUBLIC_API_URL`:**
```
NEXT_PUBLIC_API_URL=https://crreator-iq.vercel.app
```

**Critical:** 
- ✅ NO trailing slash at the end
- ✅ Use `https://` (not `http://`)
- ✅ Use the exact API project URL

### Step 3: Redeploy Both Projects

After updating environment variables:

1. **Redeploy API Project:**
   - Go to API project → Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger redeploy

2. **Redeploy Web Project:**
   - Go to Web project → Deployments tab  
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger redeploy

### Step 4: Verify the Fix

1. Check API health endpoint:
   ```
   https://crreator-iq.vercel.app/health
   ```

2. Test CORS from browser console (on your web app):
   ```javascript
   fetch('https://crreator-iq.vercel.app/graphql', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ query: '{ __typename }' })
   })
   ```

3. Check browser Network tab:
   - Look for OPTIONS request to `/graphql`
   - Should return 200 status
   - Should have `Access-Control-Allow-Origin` header

## Common Mistakes to Avoid:

❌ **Wrong:**
```
NEXT_PUBLIC_API_URL=https://crreator-iq.vercel.app/
ALLOWED_ORIGINS=https://cre-ator-iq-web.vercel.app/
```

✅ **Correct:**
```
NEXT_PUBLIC_API_URL=https://crreator-iq.vercel.app
ALLOWED_ORIGINS=https://cre-ator-iq-web.vercel.app
```

## If Still Getting CORS Errors:

1. **Check Vercel Function Logs:**
   - Go to API project → Functions tab
   - Check for CORS-related errors
   - Look for the origin being blocked

2. **Verify Environment Variables Are Set:**
   - Make sure variables are set for **Production** environment
   - Not just Preview/Development

3. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or test in incognito/private window

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Look at the OPTIONS preflight request
   - Check response headers for CORS headers

## Expected CORS Headers:

When working correctly, you should see these headers in the response:
```
Access-Control-Allow-Origin: https://cre-ator-iq-web.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
```

