import "dotenv/config"
import { connectDB } from "../db/index.js"
import {
  UserModel,
  CreatorProfileModel,
  ContentItemModel,
  CommentBatchModel,
  SentimentSnapshotModel,
  SubscriberProfileModel,
  IdeaSuggestionModel,
} from "../db/index.js"
import { hashPassword } from "../utils/password.js"
import { ActivityService } from "../services/activity.service.js"

async function seedData() {
  try {
    await connectDB()
    console.log("✅ Connected to MongoDB")

    // Clear existing data (optional - uncomment to reset)
    // await UserModel.deleteMany({})
    // await CreatorProfileModel.deleteMany({})
    // await ContentItemModel.deleteMany({})
    // await SubscriberProfileModel.deleteMany({})
    // await CommentBatchModel.deleteMany({})
    // await SentimentSnapshotModel.deleteMany({})
    // await IdeaSuggestionModel.deleteMany({})

    console.log("\n📦 Seeding database with comprehensive data...\n")

    // ========== USERS ==========
    const users = []
    const passwords = {
      creator: await hashPassword("password123"),
      subscriber1: await hashPassword("password123"),
      subscriber2: await hashPassword("password123"),
      subscriber3: await hashPassword("password123"),
      subscriber4: await hashPassword("password123"),
      subscriber5: await hashPassword("password123"),
      admin: await hashPassword("admin123"),
    }

    // Admin user
    const adminUser = await UserModel.findOneAndUpdate(
      { email: "admin@example.com" },
      {
        email: "admin@example.com",
        passwordHash: passwords.admin,
        name: "Admin User",
        role: "ADMIN",
      },
      { upsert: true, new: true }
    )
    users.push(adminUser)
    console.log("👤 Created admin user:", (adminUser as any).email)

    // Create additional admin user for testing
    const adminUser2 = await UserModel.findOneAndUpdate(
      { email: "admin2@example.com" },
      {
        email: "admin2@example.com",
        passwordHash: passwords.admin,
        name: "Admin User 2",
        role: "ADMIN",
      },
      { upsert: true, new: true }
    )
    users.push(adminUser2)
    console.log("👤 Created admin user 2:", (adminUser2 as any).email)
    
    // Log admin registration activities
    try {
      await ActivityService.logActivity({
        eventType: "USER_REGISTER",
        userId: adminUser._id.toString(),
        metadata: { role: "ADMIN" },
      })
      await ActivityService.logActivity({
        eventType: "USER_REGISTER",
        userId: adminUser2._id.toString(),
        metadata: { role: "ADMIN" },
      })
    } catch (err) {
      console.warn("Could not log admin registration activity:", err)
    }

    // Creator 1 - Tech
    const creator1User = await UserModel.findOneAndUpdate(
      { email: "creator@example.com" },
      {
        email: "creator@example.com",
        passwordHash: passwords.creator,
        name: "John Creator",
        role: "CREATOR",
      },
      { upsert: true, new: true }
    )
    users.push(creator1User)
    console.log("👤 Created creator 1:", (creator1User as any).email)
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: creator1User._id.toString(),
      metadata: { role: "CREATOR" },
    })

    // Creator 2 - Design
    const creator2User = await UserModel.findOneAndUpdate(
      { email: "designer@example.com" },
      {
        email: "designer@example.com",
        passwordHash: passwords.creator,
        name: "Sarah Designer",
        role: "CREATOR",
      },
      { upsert: true, new: true }
    )
    users.push(creator2User)
    console.log("👤 Created creator 2:", (creator2User as any).email)
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: creator2User._id.toString(),
      metadata: { role: "CREATOR" },
    })

    // Creator 3 - Business
    const creator3User = await UserModel.findOneAndUpdate(
      { email: "business@example.com" },
      {
        email: "business@example.com",
        passwordHash: passwords.creator,
        name: "Mike Business",
        role: "CREATOR",
      },
      { upsert: true, new: true }
    )
    users.push(creator3User)
    console.log("👤 Created creator 3:", (creator3User as any).email)
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: creator3User._id.toString(),
      metadata: { role: "CREATOR" },
    })

    // Subscriber users
    const subscriberUsers = []
    const subscriberData = [
      { email: "subscriber@example.com", name: "Jane Subscriber", role: "SUBSCRIBER_T2" },
      { email: "premium@example.com", name: "Premium User", role: "SUBSCRIBER_T3" },
      { email: "sub1@example.com", name: "Alice Fan", role: "SUBSCRIBER_T1" },
      { email: "sub2@example.com", name: "Bob Enthusiast", role: "SUBSCRIBER_T2" },
      { email: "sub3@example.com", name: "Charlie Premium", role: "SUBSCRIBER_T3" },
      { email: "sub4@example.com", name: "Diana Supporter", role: "SUBSCRIBER_T1" },
      { email: "sub5@example.com", name: "Eve Member", role: "SUBSCRIBER_T2" },
    ]

    for (const sub of subscriberData) {
      const subUser = await UserModel.findOneAndUpdate(
        { email: sub.email },
        {
          email: sub.email,
          passwordHash: passwords.subscriber1,
          name: sub.name,
          role: sub.role,
        },
        { upsert: true, new: true }
      )
      subscriberUsers.push(subUser)
      users.push(subUser)
      await ActivityService.logActivity({
        eventType: "USER_REGISTER",
        userId: subUser._id.toString(),
        metadata: { role: sub.role },
      })
    }
    console.log(`👥 Created ${subscriberUsers.length} subscriber users`)

    // ========== CREATOR PROFILES ==========
    const creator1Profile = await CreatorProfileModel.findOneAndUpdate(
      { userId: creator1User._id },
      {
        userId: creator1User._id,
        displayName: "Tech Guru",
        bio: "I create amazing tech content and tutorials. Join me on this journey of learning and innovation!",
        primaryPlatform: "YouTube",
        niche: "Technology",
      },
      { upsert: true, new: true }
    )
    console.log("🎬 Created creator profile 1:", (creator1Profile as any).displayName)
    await ActivityService.logActivity({
      eventType: "CREATOR_PROFILE_CREATED",
      userId: creator1User._id.toString(),
      creatorId: creator1Profile._id.toString(),
      metadata: { displayName: (creator1Profile as any).displayName, niche: (creator1Profile as any).niche },
    })

    const creator2Profile = await CreatorProfileModel.findOneAndUpdate(
      { userId: creator2User._id },
      {
        userId: creator2User._id,
        displayName: "Design Master",
        bio: "UI/UX design tutorials, Figma tips, and creative inspiration for designers.",
        primaryPlatform: "YouTube",
        niche: "Design",
      },
      { upsert: true, new: true }
    )
    console.log("🎬 Created creator profile 2:", (creator2Profile as any).displayName)
    await ActivityService.logActivity({
      eventType: "CREATOR_PROFILE_CREATED",
      userId: creator2User._id.toString(),
      creatorId: creator2Profile._id.toString(),
      metadata: { displayName: (creator2Profile as any).displayName, niche: (creator2Profile as any).niche },
    })

    const creator3Profile = await CreatorProfileModel.findOneAndUpdate(
      { userId: creator3User._id },
      {
        userId: creator3User._id,
        displayName: "Business Coach",
        bio: "Entrepreneurship, marketing strategies, and business growth tips for startups.",
        primaryPlatform: "YouTube",
        niche: "Business",
      },
      { upsert: true, new: true }
    )
    console.log("🎬 Created creator profile 3:", (creator3Profile as any).displayName)
    await ActivityService.logActivity({
      eventType: "CREATOR_PROFILE_CREATED",
      userId: creator3User._id.toString(),
      creatorId: creator3Profile._id.toString(),
      metadata: { displayName: (creator3Profile as any).displayName, niche: (creator3Profile as any).niche },
    })

    // ========== CONTENT ITEMS ==========
    const contentItems = []

    // Creator 1 content - Tech/Programming
    const creator1Content = [
      {
        creatorId: creator1Profile._id,
        title: "Introduction to React Hooks",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Learn the basics of React Hooks in this comprehensive tutorial. Perfect for beginners looking to understand useState, useEffect, and custom hooks.",
        contentUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
      },
      {
        creatorId: creator1Profile._id,
        title: "Advanced TypeScript Patterns",
        type: "course",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Master advanced TypeScript patterns and best practices. Learn generics, conditional types, and type-safe programming.",
        contentUrl: "https://www.udemy.com/course/typescript-the-complete-developers-guide/",
      },
      {
        creatorId: creator1Profile._id,
        title: "Building Full-Stack Apps with Next.js",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Complete guide to building production-ready full-stack applications with Next.js 14, including authentication, database integration, and deployment.",
        contentUrl: "https://www.udemy.com/course/nextjs-full-stack-app-development/",
      },
      {
        creatorId: creator1Profile._id,
        title: "Weekly Tech News Roundup",
        type: "post",
        isPremium: false,
        status: "published",
        description: "This week's top tech news and updates from the developer world. Stay informed about the latest trends and technologies.",
        contentUrl: "https://medium.com/tag/technology",
      },
      {
        creatorId: creator1Profile._id,
        title: "Node.js Performance Optimization",
        type: "video",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Learn how to optimize Node.js applications for better performance. Covers caching, clustering, and profiling techniques.",
        contentUrl: "https://www.youtube.com/watch?v=3aGSqasVPsI",
      },
      {
        creatorId: creator1Profile._id,
        title: "Docker for Developers",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Complete Docker tutorial for containerization. Learn Dockerfile best practices, docker-compose, and container orchestration.",
        contentUrl: "https://www.udemy.com/course/docker-mastery/",
      },
      {
        creatorId: creator1Profile._id,
        title: "JavaScript Fundamentals Refresher",
        type: "video",
        isPremium: false,
        status: "published",
        description: "A quick refresher on JavaScript fundamentals including closures, promises, and async/await patterns.",
        contentUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      },
      {
        creatorId: creator1Profile._id,
        title: "GraphQL API Design",
        type: "course",
        isPremium: true,
        requiredTier: "T1",
        status: "published",
        description: "Learn how to design and implement GraphQL APIs. Covers schema design, resolvers, and best practices.",
        contentUrl: "https://www.udemy.com/course/graphql-bootcamp/",
      },
    ]

    // Creator 2 content - Design/UI
    const creator2Content = [
      {
        creatorId: creator2Profile._id,
        title: "Figma Design System Tutorial",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Learn how to create and maintain design systems in Figma. Build scalable component libraries and design tokens.",
        contentUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
      },
      {
        creatorId: creator2Profile._id,
        title: "UI Animation Principles",
        type: "course",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Master the art of UI animations and micro-interactions. Learn Framer Motion, CSS animations, and motion design principles.",
        contentUrl: "https://www.udemy.com/course/ui-animation-with-framer-motion/",
      },
      {
        creatorId: creator2Profile._id,
        title: "Color Theory for Designers",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Understanding color psychology and application in design. Learn how to choose color palettes that work.",
        contentUrl: "https://www.youtube.com/watch?v=Qj1FKgE8Mxo",
      },
      {
        creatorId: creator2Profile._id,
        title: "Responsive Design Masterclass",
        type: "course",
        isPremium: true,
        requiredTier: "T1",
        status: "published",
        description: "Complete guide to responsive design. Learn mobile-first approaches, breakpoints, and flexible layouts.",
        contentUrl: "https://www.udemy.com/course/responsive-web-design-html5-css3-bootstrap/",
      },
      {
        creatorId: creator2Profile._id,
        title: "Typography Essentials",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Essential typography principles for digital design. Font pairing, hierarchy, and readability tips.",
        contentUrl: "https://www.youtube.com/watch?v=sByzHoiYFX0",
      },
      {
        creatorId: creator2Profile._id,
        title: "Advanced Prototyping in Figma",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Take your Figma prototypes to the next level. Learn advanced interactions, animations, and user testing techniques.",
        contentUrl: "https://www.udemy.com/course/figma-advanced-prototyping/",
      },
    ]

    // Creator 3 content - Business/Marketing
    const creator3Content = [
      {
        creatorId: creator3Profile._id,
        title: "Startup Funding Strategies",
        type: "video",
        isPremium: false,
        status: "published",
        description: "How to secure funding for your startup. Learn about angel investors, VC funding, and bootstrapping strategies.",
        contentUrl: "https://www.youtube.com/watch?v=6reLWfFNer0",
      },
      {
        creatorId: creator3Profile._id,
        title: "Digital Marketing Masterclass",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Complete guide to digital marketing and growth hacking. SEO, social media marketing, email campaigns, and analytics.",
        contentUrl: "https://www.udemy.com/course/learn-digital-marketing-course/",
      },
      {
        creatorId: creator3Profile._id,
        title: "Building Your Personal Brand",
        type: "video",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Strategies for building a strong personal brand online. Content creation, networking, and thought leadership.",
        contentUrl: "https://www.youtube.com/watch?v=Zk9J5xnTVMA",
      },
      {
        creatorId: creator3Profile._id,
        title: "Product Launch Checklist",
        type: "post",
        isPremium: false,
        status: "published",
        description: "Essential checklist for launching your product successfully. Pre-launch, launch day, and post-launch strategies.",
        contentUrl: "https://medium.com/tag/product-launch",
      },
      {
        creatorId: creator3Profile._id,
        title: "Sales Funnel Optimization",
        type: "course",
        isPremium: true,
        requiredTier: "T1",
        status: "published",
        description: "Learn how to optimize your sales funnel for maximum conversions. A/B testing, landing pages, and conversion optimization.",
        contentUrl: "https://www.udemy.com/course/sales-funnel-optimization/",
      },
      {
        creatorId: creator3Profile._id,
        title: "Social Media Strategy for Businesses",
        type: "video",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Develop a winning social media strategy for your business. Content planning, engagement tactics, and platform selection.",
        contentUrl: "https://www.youtube.com/watch?v=Zk9J5xnTVMA",
      },
    ]

    for (const item of [...creator1Content, ...creator2Content, ...creator3Content]) {
      const created = await ContentItemModel.findOneAndUpdate(
        { creatorId: item.creatorId, title: item.title },
        item,
        { upsert: true, new: true }
      )
      contentItems.push(created)
      
      // Log content creation activity
      await ActivityService.logActivity({
        eventType: "CONTENT_CREATED",
        creatorId: item.creatorId.toString(),
        metadata: { contentId: created._id.toString(), title: item.title, type: item.type },
      })
      
      // Log content published activity if status is published
      if (item.status === "published") {
        await ActivityService.logActivity({
          eventType: "CONTENT_PUBLISHED",
          creatorId: item.creatorId.toString(),
          metadata: { contentId: created._id.toString(), title: item.title, isPremium: item.isPremium },
        })
      }
    }
    console.log(`📝 Created ${contentItems.length} content items`)

    // ========== SUBSCRIBERS ==========
    const subscribers = []
    const subscriberProfiles = [
      { user: subscriberUsers[0], creator: creator1Profile, tier: "T2" },
      { user: subscriberUsers[1], creator: creator1Profile, tier: "T3" }, // Premium user - T3
      { user: subscriberUsers[2], creator: creator1Profile, tier: "T1" },
      { user: subscriberUsers[3], creator: creator1Profile, tier: "T2" },
      { user: subscriberUsers[4], creator: creator1Profile, tier: "T3" },
      { user: subscriberUsers[5], creator: creator2Profile, tier: "T1" },
      { user: subscriberUsers[6], creator: creator2Profile, tier: "T2" },
      { user: subscriberUsers[0], creator: creator2Profile, tier: "T1" },
      { user: subscriberUsers[1], creator: creator2Profile, tier: "T3" }, // Premium user - T3 to creator 2
      { user: subscriberUsers[1], creator: creator3Profile, tier: "T3" }, // Premium user - T3 to creator 3
    ]

    for (const sub of subscriberProfiles) {
      const subscriber = await SubscriberProfileModel.findOneAndUpdate(
        { userId: sub.user._id, creatorId: sub.creator._id },
        {
          userId: sub.user._id,
          creatorId: sub.creator._id,
          tier: sub.tier,
          joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        },
        { upsert: true, new: true }
      )
      subscribers.push(subscriber)
      await ActivityService.logActivity({
        eventType: "SUBSCRIBER_JOINED",
        userId: sub.user._id.toString(),
        creatorId: sub.creator._id.toString(),
        metadata: { tier: sub.tier },
      })
    }
    console.log(`👥 Created ${subscribers.length} subscriber profiles`)

    // ========== COMMENT BATCHES ==========
    const commentBatches = []

    // Creator 1 comment batches
    const batch1 = await CommentBatchModel.create({
      creatorId: creator1Profile._id,
      source: "MANUAL_PASTE",
      rawComments: [
        { author: "user1", text: "Great video! Really helped me understand React Hooks", timestamp: new Date() },
        { author: "user2", text: "Love your content! Keep it up!", timestamp: new Date() },
        { author: "user3", text: "Could you make a video about Next.js 14?", timestamp: new Date() },
        { author: "user4", text: "Amazing tutorial, thank you!", timestamp: new Date() },
        { author: "user5", text: "The TypeScript course is excellent!", timestamp: new Date() },
        { author: "user6", text: "More advanced topics please!", timestamp: new Date() },
        { author: "user7", text: "Your explanations are so clear", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      linkedContentItemId: contentItems[0]._id,
    })
    commentBatches.push(batch1)

    const batch2 = await CommentBatchModel.create({
      creatorId: creator1Profile._id,
      source: "YouTube",
      rawComments: [
        { author: "viewer1", text: "This changed my development workflow completely", timestamp: new Date() },
        { author: "viewer2", text: "Can you do a deep dive on performance?", timestamp: new Date() },
        { author: "viewer3", text: "Subscribed! Amazing content", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    })
    commentBatches.push(batch2)
    await ActivityService.logActivity({
      eventType: "COMMENT_BATCH_IMPORTED",
      creatorId: creator1Profile._id.toString(),
      metadata: { batchId: batch2._id.toString(), commentCount: ((batch2 as any).rawComments || []).length },
    })

    // Creator 2 comment batch
    const batch3 = await CommentBatchModel.create({
      creatorId: creator2Profile._id,
      source: "MANUAL_PASTE",
      rawComments: [
        { author: "designer1", text: "Love your Figma tutorials!", timestamp: new Date() },
        { author: "designer2", text: "Can you cover accessibility in design?", timestamp: new Date() },
        { author: "designer3", text: "Your design system approach is brilliant", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    })
    commentBatches.push(batch3)
    await ActivityService.logActivity({
      eventType: "COMMENT_BATCH_IMPORTED",
      creatorId: creator2Profile._id.toString(),
      metadata: { batchId: batch3._id.toString(), commentCount: ((batch3 as any).rawComments || []).length },
    })

    console.log(`💬 Created ${commentBatches.length} comment batches`)

    // ========== SENTIMENT SNAPSHOTS ==========
    const sentimentSnapshots = []

    const snapshot1 = await SentimentSnapshotModel.create({
      creatorId: creator1Profile._id,
      commentBatchId: batch1._id,
      timeRangeStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(),
      overallSentimentScore: 0.85,
      positiveCount: 6,
      negativeCount: 0,
      neutralCount: 1,
      topKeywords: ["React", "Hooks", "TypeScript", "Next.js", "tutorial", "performance"],
      topRequests: ["Next.js 14 video", "More TypeScript content", "Advanced patterns", "Performance deep dive"],
      byTier: [
        { tier: "T1", sentimentScore: 0.8, positiveCount: 2, negativeCount: 0 },
        { tier: "T2", sentimentScore: 0.9, positiveCount: 3, negativeCount: 0 },
        { tier: "T3", sentimentScore: 0.85, positiveCount: 1, negativeCount: 0 },
      ],
    })
    sentimentSnapshots.push(snapshot1)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creator1Profile._id.toString(),
      metadata: { snapshotId: snapshot1._id.toString(), sentimentScore: (snapshot1 as any).overallSentimentScore },
    })

    const snapshot2 = await SentimentSnapshotModel.create({
      creatorId: creator1Profile._id,
      commentBatchId: batch2._id,
      timeRangeStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(),
      overallSentimentScore: 0.92,
      positiveCount: 3,
      negativeCount: 0,
      neutralCount: 0,
      topKeywords: ["workflow", "performance", "development"],
      topRequests: ["Performance deep dive", "More tutorials"],
    })
    sentimentSnapshots.push(snapshot2)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creator1Profile._id.toString(),
      metadata: { snapshotId: snapshot2._id.toString(), sentimentScore: (snapshot2 as any).overallSentimentScore },
    })

    const snapshot3 = await SentimentSnapshotModel.create({
      creatorId: creator2Profile._id,
      commentBatchId: batch3._id,
      timeRangeStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(),
      overallSentimentScore: 0.88,
      positiveCount: 3,
      negativeCount: 0,
      neutralCount: 0,
      topKeywords: ["Figma", "accessibility", "design system"],
      topRequests: ["Accessibility in design", "More design system content"],
    })
    sentimentSnapshots.push(snapshot3)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creator2Profile._id.toString(),
      metadata: { snapshotId: snapshot3._id.toString(), sentimentScore: (snapshot3 as any).overallSentimentScore },
    })

    console.log(`📊 Created ${sentimentSnapshots.length} sentiment snapshots`)

    // ========== IDEA SUGGESTIONS ==========
    const ideas = []

    const idea1 = await IdeaSuggestionModel.create({
      creatorId: creator1Profile._id,
      sourceSnapshotId: snapshot1._id,
      tierTarget: "all",
      ideaType: "video",
      title: "Next.js 14 Complete Guide",
      description: "Your audience is requesting Next.js 14 content. Create a comprehensive guide covering all new features and best practices.",
      outline: [
        "Introduction to Next.js 14",
        "New App Router features",
        "Server Components deep dive",
        "Performance optimizations",
        "Migration guide from Next.js 13",
      ],
      status: "new",
    })
    ideas.push(idea1)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creator1Profile._id.toString(),
      metadata: { ideaId: idea1._id.toString(), ideaType: (idea1 as any).ideaType, title: (idea1 as any).title },
    })

    const idea2 = await IdeaSuggestionModel.create({
      creatorId: creator1Profile._id,
      sourceSnapshotId: snapshot1._id,
      tierTarget: "T2",
      ideaType: "mini-course",
      title: "Advanced TypeScript Patterns Masterclass",
      description: "Your T2 subscribers want more advanced TypeScript content. Create an in-depth course on complex patterns.",
      outline: [
        "Generic constraints and conditional types",
        "Template literal types",
        "Mapped types and utility types",
        "Type-safe API design",
        "Real-world patterns and examples",
      ],
      status: "new",
    })
    ideas.push(idea2)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creator1Profile._id.toString(),
      metadata: { ideaId: idea2._id.toString(), ideaType: (idea2 as any).ideaType, title: (idea2 as any).title },
    })

    const idea3 = await IdeaSuggestionModel.create({
      creatorId: creator2Profile._id,
      sourceSnapshotId: snapshot3._id,
      tierTarget: "all",
      ideaType: "video",
      title: "Accessibility in Modern UI Design",
      description: "Your audience is interested in accessibility. Create content that helps designers build inclusive interfaces.",
      outline: [
        "WCAG guidelines overview",
        "Color contrast and readability",
        "Keyboard navigation patterns",
        "Screen reader considerations",
        "Testing for accessibility",
      ],
      status: "new",
    })
    ideas.push(idea3)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creator2Profile._id.toString(),
      metadata: { ideaId: idea3._id.toString(), ideaType: (idea3 as any).ideaType, title: (idea3 as any).title },
    })

    console.log(`💡 Created ${ideas.length} idea suggestions`)

    // ========== ADDITIONAL ACTIVITY EVENTS ==========
    // Add some login activities
    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      await ActivityService.logActivity({
        eventType: "USER_LOGIN",
        userId: randomUser._id.toString(),
        metadata: { timestamp: new Date(Date.now() - i * 3600000).toISOString() },
      })
    }

    // Add some content updates
    if (contentItems.length > 0) {
      const randomContent = contentItems[Math.floor(Math.random() * contentItems.length)]
      await ActivityService.logActivity({
        eventType: "CONTENT_UPDATED",
        creatorId: randomContent.creatorId.toString(),
        metadata: { contentId: randomContent._id.toString(), title: (randomContent as any).title },
      })
    }

    const activityCount = await ActivityService.getActivities({ limit: 1000 })
    console.log(`📊 Created ${activityCount.length} activity events`)

    // ========== SUMMARY ==========
    console.log("\n✅ Seed data created successfully!")
    console.log("\n📊 Database Summary:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`👤 Total Users: ${users.length}`)
    console.log(`   - Admins: ${users.filter((u) => u.role === "ADMIN").length}`)
    console.log(`   - Creators: ${users.filter((u) => u.role === "CREATOR").length}`)
    console.log(`   - Subscribers: ${users.filter((u) => u.role.startsWith("SUBSCRIBER")).length}`)
    console.log(`🎬 Creator Profiles: 3`)
    console.log(`📝 Content Items: ${contentItems.length}`)
    console.log(`👥 Subscriber Profiles: ${subscribers.length}`)
    console.log(`💬 Comment Batches: ${commentBatches.length}`)
    console.log(`📊 Sentiment Snapshots: ${sentimentSnapshots.length}`)
    console.log(`💡 Idea Suggestions: ${ideas.length}`)
    console.log(`📊 Activity Events: ${activityCount.length}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    console.log("\n📋 Sample Accounts:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🔐 Admin:")
    console.log("   Email: admin@example.com")
    console.log("   Password: admin123")
    console.log("   Dashboard: /admin")
    console.log("")
    console.log("👤 Creator 1 (Tech):")
    console.log("   Email: creator@example.com")
    console.log("   Password: password123")
    console.log("   Dashboard: /creator/dashboard")
    console.log("")
    console.log("👤 Creator 2 (Design):")
    console.log("   Email: designer@example.com")
    console.log("   Password: password123")
    console.log("")
    console.log("👤 Creator 3 (Business):")
    console.log("   Email: business@example.com")
    console.log("   Password: password123")
    console.log("")
    console.log("👥 Subscriber (Tier 2):")
    console.log("   Email: subscriber@example.com")
    console.log("   Password: password123")
    console.log("   Dashboard: /subscriber/dashboard")
    console.log("")
    console.log("⭐ Premium Subscriber (Tier 3):")
    console.log("   Email: premium@example.com")
    console.log("   Password: password123")
    console.log("   Dashboard: /subscriber/dashboard")
    console.log("   Access: All premium content (T1, T2, T3)")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n✨ All data is now available in the admin dashboard!")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
