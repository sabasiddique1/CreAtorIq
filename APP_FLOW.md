# CreatorIQ Application Flow

## Application Mind Map

```
CreatorIQ
│
├── Public Access
│   ├── Landing Page (/)
│   │   ├── Hero Section
│   │   ├── Features Showcase
│   │   ├── Stats & Social Proof
│   │   └── CTA → Register/Login
│   │
│   ├── Login (/login)
│   │   └── → Redirect to Role-Specific Dashboard
│   │
│   └── Register (/register)
│       ├── Role Selection (Creator/Subscriber T1/T2/T3)
│       └── → Creator: Onboarding | Subscriber: Dashboard
│
├── Creator Flow (Core Feature)
│   │
│   ├── Onboarding (/creator/onboarding)
│   │   ├── Step 1: Display Name
│   │   ├── Step 2: Bio & Niche
│   │   └── Step 3: Profile Creation
│   │       └── → Dashboard
│   │
│   ├── Dashboard (/creator/dashboard)
│   │   ├── Overview Metrics
│   │   │   ├── Total Subscribers
│   │   │   ├── Audience Sentiment Score
│   │   │   └── Content Items Count
│   │   ├── Sentiment Trend Chart
│   │   ├── Subscribers by Tier Chart
│   │   ├── Recent Content
│   │   └── Suggested Ideas Preview
│   │
│   ├── Audience & Sentiment (/creator/audience)
│   │   ├── Import Comments
│   │   │   ├── Paste Text (Manual Entry)
│   │   │   └── Upload CSV File
│   │   ├── Recent Import Batches
│   │   │   └── Analyze for Ideas Button
│   │   └── Analysis Results
│   │       ├── Sentiment Breakdown
│   │       ├── Top Keywords
│   │       └── Generate Ideas
│   │
│   ├── Content Ideas (/creator/ideas)
│   │   ├── AI-Generated Ideas List
│   │   │   ├── Filter by Tier (T1/T2/T3/All)
│   │   │   ├── Filter by Idea Type
│   │   │   └── Filter by Status
│   │   └── Idea Details
│   │       ├── Title & Description
│   │       ├── Content Outline
│   │       └── Tier Target
│   │
│   ├── Content Management (/creator/content)
│   │   ├── Create New Content
│   │   │   ├── Title
│   │   │   ├── Type (Video/Course/Post/Live Session)
│   │   │   ├── Description
│   │   │   ├── Premium Toggle
│   │   │   └── Required Tier Selection
│   │   └── Content Library
│   │       ├── Content Cards
│   │       ├── Status Badges
│   │       └── Tier Requirements
│   │
│   └── Settings (/creator/settings)
│       ├── Update Display Name
│       ├── Edit Bio
│       ├── Change Niche
│       └── Update Primary Platform
│
├── Subscriber Flow
│   │
│   └── Dashboard (/subscriber/dashboard)
│       ├── Tier Badge Display
│       ├── Premium Content Library
│       │   ├── Filter by Tier Access
│       │   └── Content Cards
│       └── Empty State (No Content)
│
└── Admin Flow
    ├── Dashboard (/admin)
    ├── User Management (/admin/users)
    ├── Creator Management (/admin/creators)
    ├── Content Moderation (/admin/content)
    ├── Analytics (/admin/analytics)
    └── Activity Log (/admin/activity)
```

## Core Creator Workflow

### Primary Flow: Comment Analysis → Content Creation

```
1. Import Comments
   └── Audience Page
       ├── Paste Comments or Upload CSV
       └── Import Button
           │
2. Analyze Comments
   └── Click "Analyze for Ideas"
       ├── AI Sentiment Analysis
       │   ├── Overall Sentiment Score
       │   ├── Positive/Negative/Neutral Counts
       │   ├── Top Keywords Extraction
       │   └── Tier-Specific Insights
       │
3. Generate Ideas
   └── AI Content Ideas Generated
       ├── Ideas Page
       │   ├── Filter by Tier
       │   ├── Filter by Type
       │   └── View Details
       │       ├── Title & Description
       │       ├── Content Outline
       │       └── Tier Target
       │
4. Create Content
   └── Content Page
       ├── Use Generated Ideas as Inspiration
       ├── Create Content Item
       │   ├── Set Title
       │   ├── Choose Type
       │   ├── Add Description
       │   ├── Mark as Premium
       │   └── Assign Tier Requirement
       └── Publish Content
           │
5. Monitor Performance
   └── Dashboard
       ├── View Subscriber Growth
       ├── Track Sentiment Trends
       └── Review Content Performance
```

## Data Flow

```
User Input (Comments)
    ↓
Comment Batch Creation
    ↓
Sentiment Analysis (AI)
    ↓
Sentiment Snapshot
    ↓
Idea Generation (AI)
    ↓
Idea Suggestions
    ↓
Content Creation
    ↓
Content Items
    ↓
Subscriber Access
```

## Key Features by Page

### Creator Dashboard
- **Metrics**: Subscribers, Sentiment, Content Count
- **Charts**: Sentiment Trend, Tier Distribution
- **Quick Actions**: Recent Content, Suggested Ideas

### Audience Page
- **Import**: Text Paste, CSV Upload
- **Analysis**: Sentiment Breakdown, Keyword Extraction
- **Ideas**: Generate AI Content Ideas

### Ideas Page
- **Filtering**: By Tier, Type, Status
- **Details**: Full Idea Descriptions & Outlines
- **Actions**: Use for Content Creation

### Content Page
- **Creation**: New Content Items
- **Management**: View All Content
- **Organization**: By Type, Status, Tier

## User Roles & Access

```
Creator
├── Full Access to Creator Features
├── Audience Analysis
├── Content Management
└── Profile Settings

Subscriber (T1/T2/T3)
├── Access to Premium Content
├── Based on Tier Level
└── Content Library View

Admin
├── User Management
├── Creator Management
├── Content Moderation
└── Platform Analytics
```

