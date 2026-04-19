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
  ActivityEventModel,
} from "../db/index.js"
import { hashPassword } from "../utils/password.js"
import { ActivityService } from "../services/activity.service.js"

async function seedData() {
  try {
    await connectDB()
    console.log("🌱 Starting database seed...")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await UserModel.deleteMany({})
    await CreatorProfileModel.deleteMany({})
    await ContentItemModel.deleteMany({})
    await SubscriberProfileModel.deleteMany({})
    await CommentBatchModel.deleteMany({})
    await SentimentSnapshotModel.deleteMany({})
    await IdeaSuggestionModel.deleteMany({})
    // Clear activity logs
    await ActivityEventModel.deleteMany({})

    // ========== USERS ==========
    console.log("👥 Creating users...")
    const passwordHash = await hashPassword("password123")
    const adminPasswordHash = await hashPassword("admin123")

    // Admin user
    const adminUser = await UserModel.create({
      email: "admin@test.com",
      passwordHash: adminPasswordHash,
      name: "Admin User",
      role: "ADMIN",
    })
    console.log("✅ Created admin user: admin@test.com / admin123")

    // Creator user
    const creatorUser = await UserModel.create({
      email: "creator@test.com",
      passwordHash: passwordHash,
      name: "Tech Creator",
      role: "CREATOR",
    })
    console.log("✅ Created creator user: creator@test.com / password123")

    // Subscriber user (T2)
    const subscriberUser = await UserModel.create({
      email: "subscriber@test.com",
      passwordHash: passwordHash,
      name: "Regular Subscriber",
      role: "SUBSCRIBER_T2",
    })
    console.log("✅ Created subscriber user: subscriber@test.com / password123")

    // Premium subscriber user (T3)
    const premiumUser = await UserModel.create({
      email: "premium@test.com",
      passwordHash: passwordHash,
      name: "Premium Subscriber",
      role: "SUBSCRIBER_T3",
    })
    console.log("✅ Created premium user: premium@test.com / password123")

    // Log user registrations
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: adminUser._id.toString(),
      metadata: { role: "ADMIN" },
    })
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: creatorUser._id.toString(),
      metadata: { role: "CREATOR" },
    })
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: subscriberUser._id.toString(),
      metadata: { role: "SUBSCRIBER_T2" },
    })
    await ActivityService.logActivity({
      eventType: "USER_REGISTER",
      userId: premiumUser._id.toString(),
      metadata: { role: "SUBSCRIBER_T3" },
    })

    // ========== CREATOR PROFILE ==========
    console.log("🎨 Creating creator profile...")
    const creatorProfile = await CreatorProfileModel.create({
      userId: creatorUser._id,
      displayName: "Tech Guru",
      bio: "I create amazing tech content and tutorials. Join me on this journey of learning and innovation!",
      primaryPlatform: "YouTube",
      niche: "Technology",
    })
    console.log("✅ Created creator profile")

    await ActivityService.logActivity({
      eventType: "CREATOR_PROFILE_CREATED",
      userId: creatorUser._id.toString(),
      creatorId: creatorProfile._id.toString(),
      metadata: { displayName: creatorProfile.displayName, niche: creatorProfile.niche },
    })

    // ========== CONTENT ITEMS ==========
    console.log("📝 Creating content items...")
    const contentItems = []

    const contentData = [
      // Free content
      {
        creatorId: creatorProfile._id,
        title: "Introduction to React Hooks",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Learn the basics of React Hooks in this comprehensive tutorial. Perfect for beginners looking to understand useState, useEffect, and custom hooks.",
        contentUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
      },
      {
        creatorId: creatorProfile._id,
        title: "JavaScript Fundamentals Refresher",
        type: "video",
        isPremium: false,
        status: "published",
        description: "A quick refresher on JavaScript fundamentals including closures, promises, and async/await patterns.",
        contentUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      },
      {
        creatorId: creatorProfile._id,
        title: "Weekly Tech News Roundup",
        type: "post",
        isPremium: false,
        status: "published",
        description: "This week's top tech news and updates from the developer world. Stay informed about the latest trends and technologies.",
        contentUrl: "https://medium.com/tag/technology",
      },
      {
        creatorId: creatorProfile._id,
        title: "Getting Started with TypeScript",
        type: "video",
        isPremium: false,
        status: "published",
        description: "Learn TypeScript from scratch. Understand types, interfaces, and how to use TypeScript in your projects.",
        contentUrl: "https://www.youtube.com/watch?v=ahCwqrYpIuM",
      },
      // T1 Premium content
      {
        creatorId: creatorProfile._id,
        title: "GraphQL API Design",
        type: "course",
        isPremium: true,
        requiredTier: "T1",
        status: "published",
        description: "Learn how to design and implement GraphQL APIs. Covers schema design, resolvers, and best practices.",
        contentUrl: "https://www.udemy.com/course/graphql-bootcamp/",
      },
      {
        creatorId: creatorProfile._id,
        title: "Node.js Basics for Beginners",
        type: "course",
        isPremium: true,
        requiredTier: "T1",
        status: "published",
        description: "Complete introduction to Node.js. Learn to build server-side applications with JavaScript.",
        contentUrl: "https://www.udemy.com/course/nodejs-basics/",
      },
      // T2 Premium content
      {
        creatorId: creatorProfile._id,
        title: "Advanced TypeScript Patterns",
        type: "course",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Master advanced TypeScript patterns and best practices. Learn generics, conditional types, and type-safe programming.",
        contentUrl: "https://www.udemy.com/course/typescript-the-complete-developers-guide/",
      },
      {
        creatorId: creatorProfile._id,
        title: "Node.js Performance Optimization",
        type: "video",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Learn how to optimize Node.js applications for better performance. Covers caching, clustering, and profiling techniques.",
        contentUrl: "https://www.youtube.com/watch?v=3aGSqasVPsI",
      },
      {
        creatorId: creatorProfile._id,
        title: "Building RESTful APIs",
        type: "course",
        isPremium: true,
        requiredTier: "T2",
        status: "published",
        description: "Learn to build robust REST APIs with Express.js. Authentication, validation, error handling, and testing.",
        contentUrl: "https://www.udemy.com/course/rest-api-development/",
      },
      // T3 Premium content
      {
        creatorId: creatorProfile._id,
        title: "Building Full-Stack Apps with Next.js",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Complete guide to building production-ready full-stack applications with Next.js 14, including authentication, database integration, and deployment.",
        contentUrl: "https://www.udemy.com/course/nextjs-full-stack-app-development/",
      },
      {
        creatorId: creatorProfile._id,
        title: "Docker for Developers",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Complete Docker tutorial for containerization. Learn Dockerfile best practices, docker-compose, and container orchestration.",
        contentUrl: "https://www.udemy.com/course/docker-mastery/",
      },
      {
        creatorId: creatorProfile._id,
        title: "Microservices Architecture",
        type: "course",
        isPremium: true,
        requiredTier: "T3",
        status: "published",
        description: "Learn to design and implement microservices architectures. Service communication, deployment, and monitoring.",
        contentUrl: "https://www.udemy.com/course/microservices-architecture/",
      },
      // Draft content
      {
        creatorId: creatorProfile._id,
        title: "Advanced React Patterns (Coming Soon)",
        type: "video",
        isPremium: true,
        requiredTier: "T2",
        status: "draft",
        description: "Deep dive into advanced React patterns and performance optimization techniques.",
        contentUrl: "",
      },
    ]

    for (const item of contentData) {
      const created = await ContentItemModel.create(item)
      contentItems.push(created)

      await ActivityService.logActivity({
        eventType: "CONTENT_CREATED",
        creatorId: item.creatorId.toString(),
        metadata: { contentId: created._id.toString(), title: item.title, type: item.type },
      })

      if (item.status === "published") {
        await ActivityService.logActivity({
          eventType: "CONTENT_PUBLISHED",
          creatorId: item.creatorId.toString(),
          metadata: { contentId: created._id.toString(), title: item.title, isPremium: item.isPremium },
        })
      }
    }
    console.log(`✅ Created ${contentItems.length} content items`)

    // ========== SUBSCRIBERS ==========
    console.log("👥 Creating subscriptions...")
    const subscribers = []

    // Regular subscriber (T2) - subscribed to creator
    const subscriber1 = await SubscriberProfileModel.create({
      userId: subscriberUser._id,
      creatorId: creatorProfile._id,
      tier: "T2",
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    })
    subscribers.push(subscriber1)
    await ActivityService.logActivity({
      eventType: "SUBSCRIBER_JOINED",
      userId: subscriberUser._id.toString(),
      creatorId: creatorProfile._id.toString(),
      metadata: { tier: "T2" },
    })

    // Premium subscriber (T3) - subscribed to creator
    const subscriber2 = await SubscriberProfileModel.create({
      userId: premiumUser._id,
      creatorId: creatorProfile._id,
      tier: "T3",
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    })
    subscribers.push(subscriber2)
    await ActivityService.logActivity({
      eventType: "SUBSCRIBER_JOINED",
      userId: premiumUser._id.toString(),
      creatorId: creatorProfile._id.toString(),
      metadata: { tier: "T3" },
    })
    console.log("✅ Created subscriptions")

    // ========== COMMENT BATCHES ==========
    console.log("💬 Creating comment batches...")
    const commentBatches = []

    // Batch 1 - Recent comments
    const batch1 = await CommentBatchModel.create({
      creatorId: creatorProfile._id,
      source: "MANUAL_PASTE",
      rawComments: [
        { author: "user1", text: "Great video! Really helped me understand React Hooks", timestamp: new Date() },
        { author: "user2", text: "Love your content! Keep it up!", timestamp: new Date() },
        { author: "user3", text: "Could you make a video about Next.js 14?", timestamp: new Date() },
        { author: "user4", text: "Amazing tutorial, thank you!", timestamp: new Date() },
        { author: "user5", text: "The TypeScript course is excellent!", timestamp: new Date() },
        { author: "user6", text: "More advanced topics please!", timestamp: new Date() },
        { author: "user7", text: "Your explanations are so clear", timestamp: new Date() },
        { author: "user8", text: "When is the next course coming?", timestamp: new Date() },
        { author: "user9", text: "This changed my development workflow", timestamp: new Date() },
        { author: "user10", text: "Can you cover Docker in more detail?", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      linkedContentItemId: contentItems[0]._id,
    })
    commentBatches.push(batch1)

    // Batch 2 - YouTube comments
    const batch2 = await CommentBatchModel.create({
      creatorId: creatorProfile._id,
      source: "YouTube",
      rawComments: [
        { author: "viewer1", text: "This changed my development workflow completely", timestamp: new Date() },
        { author: "viewer2", text: "Can you do a deep dive on performance?", timestamp: new Date() },
        { author: "viewer3", text: "Subscribed! Amazing content", timestamp: new Date() },
        { author: "viewer4", text: "More microservices content please", timestamp: new Date() },
        { author: "viewer5", text: "Your teaching style is perfect", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      linkedContentItemId: contentItems[1]._id,
    })
    commentBatches.push(batch2)

    // Batch 3 - Older comments
    const batch3 = await CommentBatchModel.create({
      creatorId: creatorProfile._id,
      source: "MANUAL_PASTE",
      rawComments: [
        { author: "fan1", text: "Best tutorial series I've watched", timestamp: new Date() },
        { author: "fan2", text: "When will you cover GraphQL?", timestamp: new Date() },
        { author: "fan3", text: "Love the practical examples", timestamp: new Date() },
        { author: "fan4", text: "Can you make a course on testing?", timestamp: new Date() },
        { author: "fan5", text: "Your content is always top-notch", timestamp: new Date() },
      ],
      importedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    })
    commentBatches.push(batch3)

    for (const batch of commentBatches) {
      await ActivityService.logActivity({
        eventType: "COMMENT_BATCH_IMPORTED",
        creatorId: creatorProfile._id.toString(),
        metadata: { batchId: batch._id.toString(), commentCount: batch.rawComments.length },
      })
    }
    console.log(`✅ Created ${commentBatches.length} comment batches`)

    // ========== SENTIMENT SNAPSHOTS ==========
    console.log("📊 Creating sentiment snapshots...")
    const sentimentSnapshots = []

    const snapshot1 = await SentimentSnapshotModel.create({
      creatorId: creatorProfile._id,
      commentBatchId: batch1._id,
      timeRangeStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(),
      overallSentimentScore: 0.88,
      positiveCount: 9,
      negativeCount: 0,
      neutralCount: 1,
      topKeywords: ["React", "Hooks", "TypeScript", "Next.js", "tutorial", "performance", "Docker", "course"],
      topRequests: ["Next.js 14 video", "More TypeScript content", "Advanced patterns", "Performance deep dive", "Docker tutorial"],
      byTier: [
        { tier: "T1", sentimentScore: 0.85, positiveCount: 3, negativeCount: 0 },
        { tier: "T2", sentimentScore: 0.90, positiveCount: 4, negativeCount: 0 },
        { tier: "T3", sentimentScore: 0.88, positiveCount: 2, negativeCount: 0 },
      ],
    })
    sentimentSnapshots.push(snapshot1)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creatorProfile._id.toString(),
      metadata: { snapshotId: snapshot1._id.toString(), sentimentScore: snapshot1.overallSentimentScore },
    })

    const snapshot2 = await SentimentSnapshotModel.create({
      creatorId: creatorProfile._id,
      commentBatchId: batch2._id,
      timeRangeStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(),
      overallSentimentScore: 0.92,
      positiveCount: 5,
      negativeCount: 0,
      neutralCount: 0,
      topKeywords: ["workflow", "performance", "development", "microservices", "teaching"],
      topRequests: ["Performance deep dive", "More tutorials", "Microservices content"],
      byTier: [
        { tier: "T1", sentimentScore: 0.90, positiveCount: 1, negativeCount: 0 },
        { tier: "T2", sentimentScore: 0.93, positiveCount: 2, negativeCount: 0 },
        { tier: "T3", sentimentScore: 0.92, positiveCount: 2, negativeCount: 0 },
      ],
    })
    sentimentSnapshots.push(snapshot2)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creatorProfile._id.toString(),
      metadata: { snapshotId: snapshot2._id.toString(), sentimentScore: snapshot2.overallSentimentScore },
    })

    const snapshot3 = await SentimentSnapshotModel.create({
      creatorId: creatorProfile._id,
      commentBatchId: batch3._id,
      timeRangeStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      timeRangeEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      overallSentimentScore: 0.85,
      positiveCount: 5,
      negativeCount: 0,
      neutralCount: 0,
      topKeywords: ["tutorial", "GraphQL", "examples", "testing", "content"],
      topRequests: ["GraphQL course", "Testing course", "More practical examples"],
    })
    sentimentSnapshots.push(snapshot3)
    await ActivityService.logActivity({
      eventType: "SENTIMENT_ANALYZED",
      creatorId: creatorProfile._id.toString(),
      metadata: { snapshotId: snapshot3._id.toString(), sentimentScore: snapshot3.overallSentimentScore },
    })
    console.log(`✅ Created ${sentimentSnapshots.length} sentiment snapshots`)

    // ========== IDEA SUGGESTIONS ==========
    console.log("💡 Creating idea suggestions...")
    const ideas = []

    // New ideas
    const idea1 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
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
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea1._id.toString(), ideaType: idea1.ideaType, title: idea1.title },
    })

    const idea2 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
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
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea2._id.toString(), ideaType: idea2.ideaType, title: idea2.title },
    })

    // Saved ideas
    const idea3 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
      sourceSnapshotId: snapshot2._id,
      tierTarget: "T3",
      ideaType: "mini-course",
      title: "Docker & Containerization Deep Dive",
      description: "Your premium subscribers are interested in Docker. Create an advanced course covering Docker, Docker Compose, and Kubernetes.",
      outline: [
        "Docker fundamentals",
        "Docker Compose for multi-container apps",
        "Container orchestration with Kubernetes",
        "Production deployment strategies",
        "Best practices and security",
      ],
      status: "saved",
    })
    ideas.push(idea3)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea3._id.toString(), ideaType: idea3.ideaType, title: idea3.title },
    })

    const idea4 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
      sourceSnapshotId: snapshot2._id,
      tierTarget: "all",
      ideaType: "video",
      title: "Performance Optimization Techniques",
      description: "Your audience wants a deep dive on performance. Create a comprehensive video covering all optimization techniques.",
      outline: [
        "Code splitting and lazy loading",
        "Caching strategies",
        "Database query optimization",
        "CDN and asset optimization",
        "Monitoring and profiling",
      ],
      status: "saved",
    })
    ideas.push(idea4)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea4._id.toString(), ideaType: idea4.ideaType, title: idea4.title },
    })

    // Implemented ideas
    const idea5 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
      sourceSnapshotId: snapshot3._id,
      tierTarget: "T1",
      ideaType: "mini-course",
      title: "GraphQL API Design",
      description: "GraphQL course based on audience requests. This has been implemented.",
      outline: [
        "GraphQL schema design",
        "Resolvers and queries",
        "Mutations and subscriptions",
        "Authentication and authorization",
        "Best practices",
      ],
      status: "implemented",
    })
    ideas.push(idea5)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea5._id.toString(), ideaType: idea5.ideaType, title: idea5.title },
    })

    const idea6 = await IdeaSuggestionModel.create({
      creatorId: creatorProfile._id,
      sourceSnapshotId: snapshot3._id,
      tierTarget: "all",
      ideaType: "video",
      title: "Testing Best Practices",
      description: "Testing course requested by audience. This has been implemented.",
      outline: [
        "Unit testing fundamentals",
        "Integration testing",
        "E2E testing strategies",
        "Test coverage and quality",
        "CI/CD integration",
      ],
      status: "implemented",
    })
    ideas.push(idea6)
    await ActivityService.logActivity({
      eventType: "IDEAS_GENERATED",
      creatorId: creatorProfile._id.toString(),
      metadata: { ideaId: idea6._id.toString(), ideaType: idea6.ideaType, title: idea6.title },
    })
    console.log(`✅ Created ${ideas.length} idea suggestions`)

    // ========== ADDITIONAL ACTIVITY EVENTS ==========
    console.log("📋 Creating activity logs...")
    
    // Login activities
    for (let i = 0; i < 10; i++) {
      const users = [adminUser, creatorUser, subscriberUser, premiumUser]
      const randomUser = users[Math.floor(Math.random() * users.length)]
      await ActivityService.logActivity({
        eventType: "USER_LOGIN",
        userId: randomUser._id.toString(),
        metadata: { timestamp: new Date(Date.now() - i * 3600000).toISOString() },
      })
    }

    // Content updates
    for (let i = 0; i < 3; i++) {
      const randomContent = contentItems[Math.floor(Math.random() * contentItems.length)]
      await ActivityService.logActivity({
        eventType: "CONTENT_UPDATED",
        creatorId: creatorProfile._id.toString(),
        metadata: { contentId: randomContent._id.toString(), title: randomContent.title },
      })
    }

    // Batch analyzed activities
    for (const batch of commentBatches) {
      await ActivityService.logActivity({
        eventType: "BATCH_ANALYZED",
        creatorId: creatorProfile._id.toString(),
        metadata: { batchId: batch._id.toString() },
      })
    }

    console.log("✅ Created activity logs")

    // ========== SUMMARY ==========
    console.log("\n" + "=".repeat(50))
    console.log("✅ SEED COMPLETE!")
    console.log("=".repeat(50))
    console.log("\n📝 Test Accounts:")
    console.log("  Admin:     admin@test.com / admin123")
    console.log("  Creator:   creator@test.com / password123")
    console.log("  Subscriber: subscriber@test.com / password123 (T2)")
    console.log("  Premium:   premium@test.com / password123 (T3)")
    console.log("\n📊 Data Created:")
    console.log(`  - ${contentItems.length} content items (free + T1/T2/T3 premium)`)
    console.log(`  - ${commentBatches.length} comment batches`)
    console.log(`  - ${sentimentSnapshots.length} sentiment snapshots`)
    console.log(`  - ${ideas.length} idea suggestions (new, saved, implemented)`)
    console.log(`  - ${subscribers.length} subscriptions`)
    console.log("  - Multiple activity logs")
    console.log("\n" + "=".repeat(50) + "\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
