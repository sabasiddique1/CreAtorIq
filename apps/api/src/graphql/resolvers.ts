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

      const subscribers = await SubscriberProfileModel.find({ creatorId })
      const subscribersByTier = {
        T1: subscribers.filter((s) => s.tier === "T1").length,
        T2: subscribers.filter((s) => s.tier === "T2").length,
        T3: subscribers.filter((s) => s.tier === "T3").length,
      }

      const recentContent = await ContentItemModel.find({ creatorId }).sort({ createdAt: -1 }).limit(5)

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
        UserModel.find({}),
      ])

      // Count users by role
      const usersByRole = users.reduce(
        (acc, user) => {
          const role = user.role
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

      await RbacService.requireCreatorOwner(context.user.userId, tier.creatorId.toString())
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

      const item = await ContentItemModel.findById(id)
      if (!item) throw new NotFoundError("Content item not found")

      await RbacService.requireCreatorOwner(context.user.userId, item.creatorId.toString())
      return ContentItemModel.findByIdAndUpdate(id, updates, { new: true })
    },

    publishContentItem: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const item = await ContentItemModel.findById(id)
      if (!item) throw new NotFoundError("Content item not found")

      await RbacService.requireCreatorOwner(context.user.userId, item.creatorId.toString())
      const published = await ContentItemModel.findByIdAndUpdate(id, { status: "published" }, { new: true })
      // Log activity
      await ActivityService.logActivity({
        eventType: "CONTENT_PUBLISHED",
        userId: context.user.userId,
        creatorId: item.creatorId.toString(),
        metadata: { contentId: id, title: item.title },
      })
      return published
    },

    deleteContentItem: async (_: any, { id }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const item = await ContentItemModel.findById(id)
      if (!item) throw new NotFoundError("Content item not found")

      // Allow admins to delete any content, or creators to delete their own
      if (context.user.role !== "ADMIN") {
        await RbacService.requireCreatorOwner(context.user.userId, item.creatorId.toString())
      }
      await ContentItemModel.findByIdAndDelete(id)
      // Log activity
      await ActivityService.logActivity({
        eventType: "CONTENT_DELETED",
        userId: context.user.userId,
        creatorId: item.creatorId.toString(),
        metadata: { contentId: id, title: item.title },
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

      const batch = await CommentBatchModel.findById(batchId)
      if (!batch) throw new NotFoundError("Batch not found")

      await RbacService.requireCreatorOwner(context.user.userId, batch.creatorId.toString())

      const sentimentResult = await AiService.analyzeComments(
        batch.rawComments.map((c) => ({
          text: c.text,
          tier: c.tier,
        })),
      )

      const snapshot = await SentimentSnapshotModel.create({
        creatorId: batch.creatorId,
        commentBatchId: batchId,
        timeRangeStart: batch.importedAt,
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
        creatorId: batch.creatorId.toString(),
        metadata: { snapshotId: snapshot._id.toString(), batchId, sentimentScore: sentimentResult.overallScore },
      })

      return snapshot
    },

    generateIdeas: async (_: any, { snapshotId, tierTarget }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("Unauthorized")
      }

      const snapshot = await SentimentSnapshotModel.findById(snapshotId)
      if (!snapshot) throw new NotFoundError("Snapshot not found")

      await RbacService.requireCreatorOwner(context.user.userId, snapshot.creatorId.toString())

      const creator = await CreatorProfileModel.findById(snapshot.creatorId)
      if (!creator) throw new NotFoundError("Creator not found")

      try {
        const ideas = await AiService.generateIdeas(
          {
            topKeywords: snapshot.topKeywords || [],
            topRequests: snapshot.topRequests || [],
            positiveCount: snapshot.positiveCount || 0,
            negativeCount: snapshot.negativeCount || 0,
          },
          creator.niche || "general",
          tierTarget,
        )

        if (ideas.length === 0) {
          throw new Error("No ideas were generated. This might be due to missing Google Gemini API key or insufficient data.")
        }

        // Save generated ideas
        const savedIdeas = await Promise.all(
          ideas.map((idea) =>
            IdeaSuggestionModel.create({
              creatorId: snapshot.creatorId,
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
          creatorId: snapshot.creatorId.toString(),
          metadata: { snapshotId, ideaCount: savedIdeas.length, tierTarget: tierTarget || "all" },
        })

        return savedIdeas
      } catch (error: any) {
        console.error("[Resolver] Error generating ideas:", error)
        throw error
      }
    },

    createSubscriber: async (_: any, { userId, creatorId, tier }: any, context: GraphQLContext) => {
      // Allow self-subscription or admin/creator
      if (context.user?.userId !== userId && context.user?.role !== "ADMIN") {
        await RbacService.requireCreatorOwner(context.user?.userId || "", creatorId)
      }

      return SubscriberProfileModel.create({ userId, creatorId, tier })
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
