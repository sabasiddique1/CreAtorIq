import { AuthService } from "../services/auth.service.js"
import { RbacService } from "../services/rbac.service.js"
import { AiService } from "../services/ai.service.js"
import { ActivityService } from "../services/activity.service.js"
import {
  UserModel,
  CreatorProfileModel,
  SubscriberProfileModel,
  SubscriptionTierModel,
  ContentItemModel,
  CommentBatchModel,
  SentimentSnapshotModel,
  IdeaSuggestionModel,
  ActivityEventModel,
  ContentViewModel,
} from "../db/index.js"
import { ValidationError, NotFoundError } from "../middleware/error-handler.js"
import type { JwtPayload } from "../utils/jwt.js"

export interface GraphQLContext {
  user?: JwtPayload
  req?: any
  res?: any
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }
      return AuthService.getCurrentUser(context.user.userId)
    },

    creatorOverview: async (_: any, { creatorId }: { creatorId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const creator = await CreatorProfileModel.findById(creatorId)
      if (!creator) {
        throw new NotFoundError("Creator not found")
      }

      const subscribers = await SubscriberProfileModel.find({ creatorId }).lean()
      const subscribersByTier = {
        T1: subscribers.filter((s: any) => s.tier === "T1").length,
        T2: subscribers.filter((s: any) => s.tier === "T2").length,
        T3: subscribers.filter((s: any) => s.tier === "T3").length,
      }

      const recentContent = await ContentItemModel.find({ creatorId }).sort({ createdAt: -1 }).limit(5).lean()

      const latestSentimentTrend = await SentimentSnapshotModel.findOne({ creatorId }).sort({ createdAt: -1 })

      return {
        creator,
        totalSubscribers: subscribers.length,
        subscribersByTier,
        recentContent,
        latestSentimentTrend,
      }
    },

    creatorProfile: async (_: any, { creatorId }: { creatorId: string }) => {
      return CreatorProfileModel.findById(creatorId)
    },

    myCreatorProfile: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }
      return CreatorProfileModel.findOne({ userId: context.user.userId })
    },

    mySubscriptions: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }
      const subscriptions = await SubscriberProfileModel.find({ userId: context.user.userId }).populate("creatorId", "displayName niche")
      return subscriptions.map((sub: any) => {
        const subObj = sub.toObject()
        // Ensure creatorId is a string, not an object
        const creatorIdStr = typeof sub.creatorId === "object" && sub.creatorId?._id 
          ? sub.creatorId._id.toString() 
          : subObj.creatorId?.toString() || subObj.creatorId
        return {
          ...subObj,
          creatorId: creatorIdStr,
          creator: sub.creatorId ? {
            _id: sub.creatorId._id.toString(),
            displayName: sub.creatorId.displayName,
            niche: sub.creatorId.niche,
          } : null,
        }
      })
    },

    contentItems: async (
      _: any,
      { creatorId, filter }: { creatorId: string; filter?: any },
      context: GraphQLContext,
    ) => {
      const query: any = { creatorId }
      if (filter?.status) query.status = filter.status
      if (filter?.type) query.type = filter.type
      if (typeof filter?.isPremium === "boolean") query.isPremium = filter.isPremium

      return ContentItemModel.find(query).sort({ createdAt: -1 })
    },

    contentItemsWithView: async (
      _: any,
      { creatorId, filter }: { creatorId: string; filter?: any },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const query: any = { creatorId }
      if (filter?.status) query.status = filter.status
      if (filter?.type) query.type = filter.type
      if (typeof filter?.isPremium === "boolean") query.isPremium = filter.isPremium

      const contentItems = await ContentItemModel.find(query).sort({ createdAt: -1 }).lean()
      const contentIds = contentItems.map((item: any) => item._id.toString())

      // Get all views for this user and these content items
      const views = await ContentViewModel.find({
        userId: context.user.userId,
        contentItemId: { $in: contentIds },
      }).lean()

      const viewedContentIds = new Set(views.map((v: any) => v.contentItemId.toString()))
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      return contentItems.map((item: any) => {
        const itemId = item._id.toString()
        const isViewed = viewedContentIds.has(itemId)
        const isNew = new Date(item.createdAt) > sevenDaysAgo && !isViewed

        return {
          ...item,
          isViewed,
          isNew,
        }
      })
    },

    sentimentSnapshots: async (_: any, { creatorId, filter }: { creatorId: string; filter?: any }) => {
      const query: any = { creatorId }
      if (filter?.startDate) query.timeRangeStart = { $gte: new Date(filter.startDate) }
      if (filter?.endDate) query.timeRangeEnd = { $lte: new Date(filter.endDate) }

      return SentimentSnapshotModel.find(query).sort({ createdAt: -1 })
    },

    ideaSuggestions: async (_: any, { creatorId, filter }: { creatorId: string; filter?: any }) => {
      const query: any = { creatorId }
      if (filter?.status) query.status = filter.status
      if (filter?.tierTarget) query.tierTarget = filter.tierTarget

      return IdeaSuggestionModel.find(query).sort({ createdAt: -1 })
    },

    subscribers: async (_: any, { creatorId, filter }: { creatorId: string; filter?: any }) => {
      const query: any = { creatorId }
      if (filter?.tier) query.tier = filter.tier

      return SubscriberProfileModel.find(query)
    },

    subscriptionTiers: async (_: any, { creatorId }: { creatorId: string }) => {
      return SubscriptionTierModel.find({ creatorId })
    },

    commentBatch: async (_: any, { id }: { id: string }) => {
      return CommentBatchModel.findById(id)
    },

    commentBatches: async (_: any, { creatorId }: { creatorId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }
      return CommentBatchModel.find({ creatorId }).sort({ importedAt: -1 })
    },

    creatorPublicProfile: async (_: any, { creatorId }: { creatorId: string }, context: GraphQLContext) => {
      if (!creatorId) {
        throw new ValidationError("Creator ID is required")
      }

      // Try to find creator by ID (handles both string and ObjectId)
      let creator = await CreatorProfileModel.findById(creatorId)
      if (!creator) {
        // Try finding by _id as string if ObjectId lookup failed
        creator = await CreatorProfileModel.findOne({ _id: creatorId })
        if (!creator) {
          throw new NotFoundError(`Creator not found with ID: ${creatorId}`)
        }
      }

      const subscriptionTiers = await SubscriptionTierModel.find({ creatorId })
      const subscribers = await SubscriberProfileModel.find({ creatorId })
      const recentContent = await ContentItemModel.find({ creatorId, status: "published" })
        .sort({ createdAt: -1 })
        .limit(3)

      let isSubscribed = false
      let currentTier: string | null = null

      if (context.user) {
        const subscription = await SubscriberProfileModel.findOne({
          userId: context.user.userId,
          creatorId,
        }).lean()
        if (subscription) {
          isSubscribed = true
          currentTier = (subscription as any).tier
        }
      }

      return {
        creator,
        subscriptionTiers,
        subscriberCount: subscribers.length,
        recentContent,
        isSubscribed,
        currentTier,
      }
    },

    discoverCreators: async (_: any, { filter }: { filter?: any }, context: GraphQLContext) => {
      const query: any = {}

      if (filter?.niche) {
        query.niche = { $regex: filter.niche, $options: "i" }
      }

      if (filter?.search) {
        query.$or = [
          { displayName: { $regex: filter.search, $options: "i" } },
          { bio: { $regex: filter.search, $options: "i" } },
          { niche: { $regex: filter.search, $options: "i" } },
        ]
      }

      const creators = await CreatorProfileModel.find(query).sort({ createdAt: -1 })

      const userId = context.user?.userId

      const result = await Promise.all(
        creators.map(async (creator) => {
          const subscribers = await SubscriberProfileModel.find({ creatorId: creator._id })
          const subscriptionTiers = await SubscriptionTierModel.find({ creatorId: creator._id })
          const recentContentCount = await ContentItemModel.countDocuments({
            creatorId: creator._id,
            status: "published",
          })

          let isSubscribed = false
          if (userId) {
            const subscription = await SubscriberProfileModel.findOne({
              userId,
              creatorId: creator._id,
            })
            isSubscribed = !!subscription
          }

          return {
            creator,
            subscriberCount: subscribers.length,
            subscriptionTiers,
            recentContentCount,
            isSubscribed,
          }
        })
      )

      return result
    },

    // Admin queries
    allUsers: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }
      return UserModel.find({}).sort({ createdAt: -1 })
    },

    allCreators: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }
      return CreatorProfileModel.find({}).sort({ createdAt: -1 })
    },

    allActivities: async (_: any, { filters }: { filters?: any }, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }
      const activities = await ActivityService.getActivities(filters)
      // Map populated fields and ensure IDs are strings
      return activities.map((activity: any) => {
        const activityObj = activity.toObject()
        return {
          _id: activityObj._id.toString(),
          creatorId: activityObj.creatorId ? (typeof activityObj.creatorId === 'object' ? activityObj.creatorId._id.toString() : activityObj.creatorId.toString()) : null,
          userId: activityObj.userId ? (typeof activityObj.userId === 'object' ? activityObj.userId._id.toString() : activityObj.userId.toString()) : null,
          eventType: activityObj.eventType,
          metadata: activityObj.metadata || {},
          createdAt: activityObj.createdAt,
          user: activity.userId && typeof activity.userId === 'object' ? {
            _id: activity.userId._id.toString(),
            name: activity.userId.name,
            email: activity.userId.email,
            role: activity.userId.role,
          } : null,
          creator: activity.creatorId && typeof activity.creatorId === 'object' ? {
            _id: activity.creatorId._id.toString(),
            displayName: activity.creatorId.displayName,
            niche: activity.creatorId.niche,
          } : null,
        }
      })
    },

    activityStats: async (_: any, { startDate, endDate }: { startDate?: Date; endDate?: Date }, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }
      return ActivityService.getActivityStats(startDate, endDate)
    },

    platformStats: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }

      const [
        totalUsers,
        totalCreators,
        totalSubscribers,
        totalContentItems,
        totalCommentBatches,
        totalSentimentSnapshots,
        users,
      ] = await Promise.all([
        UserModel.countDocuments({}),
        CreatorProfileModel.countDocuments({}),
        SubscriberProfileModel.countDocuments({}),
        ContentItemModel.countDocuments({}),
        CommentBatchModel.countDocuments({}),
        SentimentSnapshotModel.countDocuments({}),
        UserModel.find({}).lean(),
      ])

      // Count users by role
      const usersByRole = users.reduce(
        (acc, user) => {
          const role = (user as any).role
          acc[role] = (acc[role] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        totalUsers,
        totalCreators,
        totalSubscribers,
        totalContentItems,
        totalCommentBatches,
        totalSentimentSnapshots,
        usersByRole,
      }
    },

    allContentItems: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }
      const items = await ContentItemModel.find({}).sort({ createdAt: -1 }).populate("creatorId", "displayName niche")
      // Map creatorId (populated) to creator field for GraphQL
      return items.map((item: any) => ({
        ...item.toObject(),
        creator: item.creatorId ? {
          _id: item.creatorId._id,
          displayName: item.creatorId.displayName,
          niche: item.creatorId.niche,
        } : null,
      }))
    },
  },

  Mutation: {
    register: async (_: any, { email, password, name, role }: any, context: GraphQLContext) => {
      const result = await AuthService.register(email, password, name, role)
      // Log activity
      await ActivityService.logActivity({
        eventType: "USER_REGISTER",
        userId: result.user._id.toString(),
        metadata: { email, role: role || "SUBSCRIBER_T1" },
      })
      // Set cookies
      if (context.res) {
        context.res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        context.res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
      }
      return result
    },

    login: async (_: any, { email, password }: any, context: GraphQLContext) => {
      const result = await AuthService.login(email, password)
      // Log activity
      await ActivityService.logActivity({
        eventType: "USER_LOGIN",
        userId: result.user._id.toString(),
        metadata: { email, role: result.user.role },
      })
      // Set cookies
      if (context.res) {
        context.res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        context.res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
      }
      return result
    },

    createCreatorProfile: async (
      _: any,
      { displayName, bio, primaryPlatform, niche }: any,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const existing = await CreatorProfileModel.findOne({ userId: context.user.userId })
      if (existing) {
        throw new ValidationError("Creator profile already exists")
      }

      const profile = await CreatorProfileModel.create({
        userId: context.user.userId,
        displayName,
        bio,
        primaryPlatform,
        niche,
      })
      // Log activity
      await ActivityService.logActivity({
        eventType: "CREATOR_PROFILE_CREATED",
        userId: context.user.userId,
        creatorId: profile._id.toString(),
        metadata: { displayName, niche, primaryPlatform },
      })
      return profile
    },

    updateCreatorProfile: async (_: any, { id, ...updates }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      await RbacService.requireCreatorOwner(context.user.userId, id)
      return CreatorProfileModel.findByIdAndUpdate(id, updates, { new: true })
    },

    createSubscriptionTier: async (
      _: any,
      { creatorId, name, pricePerMonth, benefits }: any,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      await RbacService.requireCreatorOwner(context.user.userId, creatorId)
      return SubscriptionTierModel.create({
        creatorId,
        name,
        pricePerMonth,
        benefits: benefits || [],
      })
    },

    updateSubscriptionTier: async (_: any, { id, creatorId, ...updates }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const tier = await SubscriptionTierModel.findById(id)
      if (!tier) throw new NotFoundError("Tier not found")

      await RbacService.requireCreatorOwner(context.user.userId, (tier as any).creatorId.toString())
      return SubscriptionTierModel.findByIdAndUpdate(id, updates, { new: true })
    },

    createContentItem: async (
      _: any,
      { creatorId, title, type, isPremium, requiredTier, description, contentUrl, contentBody }: any,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      await RbacService.requireCreatorOwner(context.user.userId, creatorId)
      const item = await ContentItemModel.create({
        creatorId,
        title,
        type,
        isPremium,
        requiredTier,
        description,
        contentUrl: contentUrl || null,
        contentBody: contentBody || "",
        status: "draft",
      })
      // Log activity
      await ActivityService.logActivity({
        eventType: "CONTENT_CREATED",
        userId: context.user.userId,
        creatorId,
        metadata: { contentId: item._id.toString(), title, type, isPremium },
      })
      return item
    },

    updateContentItem: async (_: any, { id, ...updates }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const item = await ContentItemModel.findById(id).lean()
      if (!item) throw new NotFoundError("Content item not found")

      await RbacService.requireCreatorOwner(context.user.userId, (item as any).creatorId.toString())
      return ContentItemModel.findByIdAndUpdate(id, updates, { new: true })
    },

    publishContentItem: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const item = await ContentItemModel.findById(id).lean()
      if (!item) throw new NotFoundError("Content item not found")

      await RbacService.requireCreatorOwner(context.user.userId, (item as any).creatorId.toString())
      const published = await ContentItemModel.findByIdAndUpdate(id, { status: "published" }, { new: true })
      // Log activity
      await ActivityService.logActivity({
        eventType: "CONTENT_PUBLISHED",
        userId: context.user.userId,
        creatorId: (item as any).creatorId.toString(),
        metadata: { contentId: id, title: (item as any).title },
      })
      return published
    },

    deleteContentItem: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const item = await ContentItemModel.findById(id).lean()
      if (!item) throw new NotFoundError("Content item not found")

      // Allow admins to delete any content, or creators to delete their own
      if (context.user.role !== "ADMIN") {
        await RbacService.requireCreatorOwner(context.user.userId, (item as any).creatorId.toString())
      }
      await ContentItemModel.findByIdAndDelete(id)
      // Log activity
      await ActivityService.logActivity({
        eventType: "CONTENT_DELETED",
        userId: context.user.userId,
        creatorId: (item as any).creatorId.toString(),
        metadata: { contentId: id, title: (item as any).title },
      })
      return true
    },

    importCommentBatch: async (
      _: any,
      { creatorId, source, rawComments, linkedContentItemId }: any,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      await RbacService.requireCreatorOwner(context.user.userId, creatorId)

      const batch = await CommentBatchModel.create({
        creatorId,
        source,
        rawComments,
        linkedContentItemId,
        importedAt: new Date(),
      })
      // Log activity
      await ActivityService.logActivity({
        eventType: "COMMENT_BATCH_IMPORTED",
        userId: context.user.userId,
        creatorId,
        metadata: { batchId: batch._id.toString(), commentCount: rawComments.length, source },
      })
      return batch
    },

    analyzeCommentBatch: async (_: any, { batchId }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const batch = await CommentBatchModel.findById(batchId).lean()
      if (!batch) throw new NotFoundError("Batch not found")

      await RbacService.requireCreatorOwner(context.user.userId, (batch as any).creatorId.toString())

      const sentimentResult = await AiService.analyzeComments(
        ((batch as any).rawComments || []).map((c: any) => ({
          text: c.text,
          tier: c.tier,
        })),
      )

      const snapshot = await SentimentSnapshotModel.create({
        creatorId: (batch as any).creatorId,
        commentBatchId: batchId,
        timeRangeStart: (batch as any).importedAt,
        timeRangeEnd: new Date(),
        overallSentimentScore: sentimentResult.overallScore,
        positiveCount: sentimentResult.positiveCount,
        negativeCount: sentimentResult.negativeCount,
        neutralCount: sentimentResult.neutralCount,
        topKeywords: sentimentResult.topKeywords,
        topRequests: sentimentResult.topRequests,
      })
      // Log activity
      await ActivityService.logActivity({
        eventType: "SENTIMENT_ANALYZED",
        userId: context.user.userId,
        creatorId: (batch as any).creatorId.toString(),
        metadata: { snapshotId: snapshot._id.toString(), batchId, sentimentScore: sentimentResult.overallScore },
      })

      return snapshot
    },

    generateIdeas: async (_: any, { snapshotId, tierTarget }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const snapshot = await SentimentSnapshotModel.findById(snapshotId).lean()
      if (!snapshot) throw new NotFoundError("Snapshot not found")

      await RbacService.requireCreatorOwner(context.user.userId, (snapshot as any).creatorId.toString())

      const creator = await CreatorProfileModel.findById((snapshot as any).creatorId).lean()
      if (!creator) throw new NotFoundError("Creator not found")

      try {
        const ideas = await AiService.generateIdeas(
          {
            topKeywords: (snapshot as any).topKeywords || [],
            topRequests: (snapshot as any).topRequests || [],
            positiveCount: (snapshot as any).positiveCount || 0,
            negativeCount: (snapshot as any).negativeCount || 0,
          },
          (creator as any).niche || "general",
          tierTarget,
        )

        if (ideas.length === 0) {
          throw new Error("No ideas were generated. This might be due to missing Google Gemini API key or insufficient data.")
        }

        // Save generated ideas
        const savedIdeas = await Promise.all(
          ideas.map((idea) =>
            IdeaSuggestionModel.create({
              creatorId: (snapshot as any).creatorId,
              sourceSnapshotId: snapshotId,
              tierTarget: tierTarget || "all",
              ideaType: idea.ideaType,
              title: idea.title,
              description: idea.description,
              outline: idea.outline,
              status: "new",
            }),
          ),
        )
        // Log activity
        await ActivityService.logActivity({
          eventType: "IDEAS_GENERATED",
          userId: context.user.userId,
          creatorId: (snapshot as any).creatorId.toString(),
          metadata: { snapshotId, ideaCount: savedIdeas.length, tierTarget: tierTarget || "all" },
        })

        return savedIdeas
      } catch (error: any) {
        console.error("[Resolver] Error generating ideas:", error)
        throw error
      }
    },

    createSubscriber: async (_: any, { userId, creatorId, tier }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      // Use authenticated user's ID, or allow admin to specify
      const targetUserId = context.user.role === "ADMIN" && userId ? userId : context.user.userId

      // Check if already subscribed
      const existing = await SubscriberProfileModel.findOne({
        userId: targetUserId,
        creatorId,
      })

      if (existing) {
        // Update tier if different
        if ((existing as any).tier !== tier) {
          ;(existing as any).tier = tier
          await existing.save()
          return existing
        }
        return existing
      }

      const subscription = await SubscriberProfileModel.create({
        userId: targetUserId,
        creatorId,
        tier,
      })

      // Log activity
      await ActivityService.logActivity({
        eventType: "SUBSCRIBER_JOINED",
        userId: targetUserId,
        creatorId,
        metadata: { tier, subscriptionId: subscription._id.toString() },
      })

      return subscription
    },

    markContentAsViewed: async (_: any, { contentItemId }: { contentItemId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      // Check if content exists
      const content = await ContentItemModel.findById(contentItemId).lean()
      if (!content) {
        throw new NotFoundError("Content not found")
      }

      // Check if user has access (is subscribed to creator)
      const subscription = await SubscriberProfileModel.findOne({
        userId: context.user.userId,
        creatorId: (content as any).creatorId,
      }).lean()

      if (!subscription && (content as any).isPremium) {
        throw new Error("You must be subscribed to view this content")
      }

      // Check tier access for premium content
      if ((content as any).isPremium && (content as any).requiredTier) {
        const tierHierarchy: Record<string, string[]> = {
          T1: ["T1"],
          T2: ["T1", "T2"],
          T3: ["T1", "T2", "T3"],
        }
        const accessibleTiers = tierHierarchy[(subscription as any)?.tier || ""] || []
        if (!accessibleTiers.includes((content as any).requiredTier)) {
          throw new Error("Your subscription tier does not have access to this content")
        }
      }

      // Create or update view record
      await ContentViewModel.findOneAndUpdate(
        {
          userId: context.user.userId,
          contentItemId,
        },
        {
          userId: context.user.userId,
          contentItemId,
          viewedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      )

      return true
    },

    // Admin mutations
    updateUser: async (_: any, { id, name, email, role }: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }

      const updates: any = {}
      if (name !== undefined) updates.name = name
      if (email !== undefined) updates.email = email
      if (role !== undefined) updates.role = role

      const updated = await UserModel.findByIdAndUpdate(id, updates, { new: true })
      if (!updated) throw new NotFoundError("User not found")

      return updated
    },

    deleteUser: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }

      // Prevent deleting yourself
      if (context.user.userId === id) {
        throw new ValidationError("Cannot delete your own account")
      }

      // Also delete associated creator profile if exists
      const creatorProfile = await CreatorProfileModel.findOne({ userId: id })
      if (creatorProfile) {
        await CreatorProfileModel.findByIdAndDelete(creatorProfile._id)
      }

      await UserModel.findByIdAndDelete(id)
      return true
    },

    deleteCreatorProfile: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }

      await CreatorProfileModel.findByIdAndDelete(id)
      return true
    },

    updateContentItemStatus: async (_: any, { id, status }: any, context: GraphQLContext) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
      }

      const updated = await ContentItemModel.findByIdAndUpdate(id, { status }, { new: true })
      if (!updated) throw new NotFoundError("Content item not found")

      return updated
    },
  },
}
