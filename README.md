# CreatorIQ

AI-powered platform for content creators to analyze audience sentiment and generate monetization ideas.

## Features

- **Audience Analytics**: Sentiment analysis of community feedback
- **AI Content Ideas**: Smart suggestions tailored by subscriber tier
- **Content Management**: Organize premium tier-based content
- **Subscription Tiers**: T1, T2, T3 monetization model

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, GraphQL (Apollo Server)
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini / OpenAI integration
- **Auth**: JWT with HTTP-only cookies

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your MongoDB URI and API keys

# Run development servers
pnpm dev
```

Access:
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:3001/graphql

## Environment Variables

**Backend** (`apps/api/.env`):
```
MONGODB_URI=mongodb://localhost:27017/creatoriq
JWT_SECRET=your-secret-key
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
ALLOWED_ORIGINS=http://localhost:3000
PORT=3001
```

**Frontend** (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
apps/
  ├── web/          # Next.js frontend
  └── api/          # Express + GraphQL backend
packages/
  ├── types/        # Shared TypeScript types
  └── config/       # Shared constants
```

## Scripts

```bash
pnpm dev      # Start development servers
pnpm build    # Build for production
pnpm lint     # Run linter
```

## License

MIT
