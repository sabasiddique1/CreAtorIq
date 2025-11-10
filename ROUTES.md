# Application Routes Documentation

## Overview
This is a Next.js application (App Router) with an Express + GraphQL API backend. The application supports multiple user roles: Creators, Subscribers (T1/T2/T3), and Admins.

---

## Frontend Routes (Next.js App Router)

### Public Routes

#### `/` (Root/Landing Page)
- **File**: `apps/web/src/app/page.tsx`
- **Description**: Public landing page with hero section, features, and CTAs
- **Access**: Public (no authentication required)
- **Features**:
  - Navigation to login/register
  - Hero section with value proposition
  - Features showcase
  - Call-to-action buttons

#### `/login`
- **File**: `apps/web/src/app/login/page.tsx`
- **Description**: User login page
- **Access**: Public
- **Features**:
  - Email/password login form
  - Redirects to `/creator/dashboard` for creators
  - Redirects to `/subscriber/dashboard` for subscribers
  - Link to registration page

#### `/register`
- **File**: `apps/web/src/app/register/page.tsx`
- **Description**: User registration page
- **Access**: Public
- **Features**:
  - Registration form (name, email, password, role)
  - Role selection: Creator, Subscriber T1/T2/T3
  - Query param support: `?role=SUBSCRIBER_T1` for direct subscriber signup
  - Redirects to `/creator/onboarding` for creators
  - Redirects to `/subscriber/dashboard` for subscribers

---

### Creator Routes (Protected - Requires CREATOR role)

All creator routes are wrapped in `apps/web/src/app/creator/layout.tsx` which:
- Checks authentication
- Redirects non-creators to home
- Provides shared `CreatorHeader` component

#### `/creator/onboarding`
- **File**: `apps/web/src/app/creator/onboarding/page.tsx`
- **Description**: Multi-step onboarding wizard for new creators
- **Access**: Creator only (redirects if not creator)
- **Steps**:
  1. Display name setup
  2. Bio and niche/category
  3. Confirmation and profile creation
- **Post-completion**: Redirects to `/creator/dashboard`

#### `/creator/dashboard`
- **File**: `apps/web/src/app/creator/dashboard/page.tsx`
- **Description**: Main creator dashboard with overview metrics
- **Access**: Creator only
- **Features**:
  - Total subscribers count
  - Audience sentiment score
  - Content items count
  - Sentiment trend chart (placeholder)
  - Recent content section
  - Suggested ideas section

#### `/creator/audience`
- **File**: `apps/web/src/app/creator/audience/page.tsx`
- **Description**: Audience sentiment analysis and comment import
- **Access**: Creator only
- **Features**:
  - Import comments (paste text or CSV upload)
  - Recent import batches display
  - Comment analysis interface

#### `/creator/content`
- **File**: `apps/web/src/app/creator/content/page.tsx`
- **Description**: Content management for creators
- **Access**: Creator only
- **Features**:
  - Create new content items
  - Content type selection (video, course, post, live_session)
  - Premium content toggle
  - Content list display

#### `/creator/ideas`
- **File**: `apps/web/src/app/creator/ideas/page.tsx`
- **Description**: AI-generated monetization ideas
- **Access**: Creator only
- **Features**:
  - Display AI-generated content ideas
  - Ideas filtered by subscriber tier
  - Empty state with call-to-action

#### `/creator/settings`
- **File**: `apps/web/src/app/creator/settings/page.tsx`
- **Description**: Creator profile settings
- **Access**: Creator only
- **Features**:
  - Update display name
  - Edit bio
  - Change niche/category
  - Update primary platform (YouTube, Twitch, etc.)

---

### Subscriber Routes (Protected - Requires SUBSCRIBER role)

#### `/subscriber/dashboard`
- **File**: `apps/web/src/app/subscriber/dashboard/page.tsx`
- **Description**: Premium content library for subscribers
- **Access**: Subscriber only (T1, T2, or T3)
- **Features**:
  - Display subscriber tier badge
  - Premium content library grid
  - Content cards with tier-specific access
  - Empty state for upcoming content

---

### Admin Routes (Protected - Requires ADMIN role)

#### `/admin`
- **File**: `apps/web/src/app/admin/page.tsx`
- **Description**: Admin dashboard for platform management
- **Access**: Admin only (redirects if not admin)
- **Features**:
  - Total users count
  - Active creators count
  - System status indicator
  - Platform overview section

---

## Backend API Routes (Express + GraphQL)

### REST Endpoints

#### `GET /health`
- **File**: `apps/api/src/server.ts`
- **Description**: Health check endpoint
- **Access**: Public
- **Response**: `{ status: "ok", timestamp: ISO string }`

### GraphQL Endpoint

#### `POST /graphql`
- **File**: `apps/api/src/server.ts`
- **Description**: Apollo GraphQL server endpoint
- **Access**: Public (with optional authentication)
- **Schema**: `apps/api/src/graphql/schema.ts`
- **Resolvers**: `apps/api/src/graphql/resolvers.ts`

### GraphQL Queries

1. **`me`** - Get current authenticated user
2. **`creatorOverview(creatorId: ID!)`** - Get creator dashboard data
3. **`creatorProfile(creatorId: ID!)`** - Get creator profile
4. **`contentItems(creatorId: ID!, filter: ContentFilterInput)`** - Get content items
5. **`sentimentSnapshots(creatorId: ID!, filter: SentimentFilterInput)`** - Get sentiment analysis
6. **`ideaSuggestions(creatorId: ID!, filter: IdeaFilterInput)`** - Get AI-generated ideas
7. **`subscribers(creatorId: ID!, filter: SubscriberFilterInput)`** - Get subscriber list
8. **`subscriptionTiers(creatorId: ID!)`** - Get subscription tiers
9. **`commentBatch(id: ID!)`** - Get comment batch details

### GraphQL Mutations

1. **`register(email, password, name, role)`** - User registration
2. **`login(email, password)`** - User authentication
3. **`createCreatorProfile(displayName, bio, primaryPlatform, niche)`** - Create creator profile
4. **`updateCreatorProfile(id, displayName, bio, niche)`** - Update creator profile
5. **`createSubscriptionTier(creatorId, name, pricePerMonth, benefits)`** - Create subscription tier
6. **`updateSubscriptionTier(id, name, pricePerMonth, benefits)`** - Update subscription tier
7. **`createContentItem(creatorId, title, type, isPremium, requiredTier, description)`** - Create content
8. **`updateContentItem(id, title, type, status)`** - Update content
9. **`publishContentItem(id)`** - Publish content
10. **`deleteContentItem(id)`** - Delete content
11. **`importCommentBatch(creatorId, source, rawComments, linkedContentItemId)`** - Import comments
12. **`analyzeCommentBatch(batchId)`** - Run sentiment analysis
13. **`generateIdeas(snapshotId, tierTarget)`** - Generate AI content ideas
14. **`createSubscriber(userId, creatorId, tier)`** - Create subscriber profile

---

## Route Protection & Authentication

### Frontend Protection
- **Creator routes**: Protected by `creator/layout.tsx` - checks for `ROLES.CREATOR`
- **Subscriber routes**: Protected by component-level checks - checks for `SUBSCRIBER_*` roles
- **Admin routes**: Protected by component-level checks - checks for `ROLES.ADMIN`
- **Auth state**: Managed by Zustand store (`hooks/use-auth-store.ts`)

### Backend Protection
- **GraphQL**: Uses optional auth middleware (`middleware/auth.ts`)
- **JWT tokens**: Stored in HTTP-only cookies
- **RBAC**: Role-based access control via `services/rbac.service.ts`

---

## Default Ports

- **Frontend (Next.js)**: `http://localhost:3000`
- **Backend (Express/GraphQL)**: `http://localhost:3001`
- **GraphQL Playground**: `http://localhost:3001/graphql`

---

## User Roles

1. **CREATOR** - Content creators who manage audience and content
2. **SUBSCRIBER_T1** - Tier 1 subscribers
3. **SUBSCRIBER_T2** - Tier 2 subscribers
4. **SUBSCRIBER_T3** - Tier 3 subscribers
5. **ADMIN** - Platform administrators

---

## Navigation Flow

### New User Journey
1. Landing (`/`) → Register (`/register`)
2. Creator: Register → Onboarding (`/creator/onboarding`) → Dashboard (`/creator/dashboard`)
3. Subscriber: Register → Dashboard (`/subscriber/dashboard`)

### Returning User Journey
1. Landing (`/`) → Login (`/login`)
2. Creator: Login → Dashboard (`/creator/dashboard`)
3. Subscriber: Login → Dashboard (`/subscriber/dashboard`)

### Creator Workflow
- Dashboard → Audience (import comments) → Ideas (generate AI suggestions) → Content (create premium content) → Settings (manage profile)

