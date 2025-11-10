# AI Provider Setup Guide

This app supports multiple AI providers for generating content ideas. **Google Gemini is recommended as it has a generous free tier!**

## Option 1: Google Gemini (Recommended - FREE!)

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with something like `AIza...`)

### Step 2: Add to Your App
1. Open `apps/api/.env` file
2. Add this line:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
   ```
3. Replace `your-api-key-here` with your actual API key

### Step 3: Restart the API Server
```bash
cd apps/api
pnpm dev
```

### Free Tier Limits
- **60 requests per minute** (very generous!)
- **1,500 requests per day**
- **32,000 tokens per minute**

## Option 2: OpenAI (Paid, but more powerful)

### Step 1: Get Your API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-...`)

### Step 2: Add to Your App
1. Open `apps/api/.env` file
2. Add this line:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Replace `sk-your-key-here` with your actual API key

### Pricing
- Pay per use (around $0.15 per 1M tokens for GPT-4o-mini)

## How It Works

The app will automatically use:
1. **Google Gemini** if `GOOGLE_GENERATIVE_AI_API_KEY` is set
2. **OpenAI** if only `OPENAI_API_KEY` is set
3. **Error** if neither is set

## Testing

After setting up your API key:
1. Go to `/creator/audience`
2. Import some comments
3. Click "Analyze for Ideas"
4. Go to `/creator/ideas`
5. Click "Generate Ideas"
6. You should see AI-generated content ideas!

## Troubleshooting

### "No AI API key configured" error
- Make sure you added the API key to `apps/api/.env`
- Make sure the file is named exactly `.env` (not `.env.example`)
- Restart the API server after adding the key

### "API key invalid" error
- Double-check you copied the entire API key
- Make sure there are no extra spaces
- For Google Gemini, make sure you're using the key from AI Studio (not a different service)

### Still not working?
- Check the API server terminal for detailed error messages
- Check the browser console for errors
- Make sure the API server is running: `cd apps/api && pnpm dev`

