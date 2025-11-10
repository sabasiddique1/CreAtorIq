import { gql } from "graphql-tag"

export const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    _id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type CreatorProfile {
    _id: ID!
    userId: ID!
    displayName: String!
    bio: String!
    avatarUrl: String
    primaryPlatform: String!
    niche: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type SubscriberProfile {
    _id: ID!
    userId: ID!
    creatorId: ID!
    creator: CreatorProfile
    tier: String!
    joinedAt: Date!
  }

  type SubscriptionTier {
    _id: ID!
    creatorId: ID!
    name: String!
    pricePerMonth: Float!
    benefits: [String!]!
    stripePriceId: String
    createdAt: Date!
    updatedAt: Date!
  }

  type ContentItem {
    _id: ID!
    creatorId: ID!
    creator: CreatorProfile
    title: String!
    type: String!
    isPremium: Boolean!
    requiredTier: String
    status: String!
    description: String
    contentUrl: String
    contentBody: String
    createdAt: Date!
    updatedAt: Date!
  }

  type CommentBatch {
    _id: ID!
    creatorId: ID!
    source: String!
    rawComments: [JSON!]!
    importedAt: Date!
    linkedContentItemId: ID
  }

  type SentimentSnapshot {
    _id: ID!
    creatorId: ID!
    commentBatchId: ID!
    timeRangeStart: Date!
    timeRangeEnd: Date!
    overallSentimentScore: Float!
    positiveCount: Int!
    negativeCount: Int!
    neutralCount: Int!
    topKeywords: [String!]!
    topRequests: [String!]!
    byTier: [TierSentiment!]
    createdAt: Date!
  }

  type TierSentiment {
    tier: String!
    sentimentScore: Float!
    positiveCount: Int!
    negativeCount: Int!
  }

  type IdeaSuggestion {
    _id: ID!
    creatorId: ID!
    sourceSnapshotId: ID!
    tierTarget: String!
    ideaType: String!
    title: String!
    description: String!
    outline: [String!]!
    status: String!
    createdAt: Date!
  }

  type ActivityEvent {
    _id: ID!
    creatorId: ID!
    userId: ID
    eventType: String!
    metadata: JSON!
    createdAt: Date!
  }

  type CreatorOverview {
    creator: CreatorProfile!
    totalSubscribers: Int!
    subscribersByTier: JSON!
    recentContent: [ContentItem!]!
    latestSentimentTrend: SentimentSnapshot
  }

  type PlatformStats {
    totalUsers: Int!
    totalCreators: Int!
    totalSubscribers: Int!
    totalContentItems: Int!
    totalCommentBatches: Int!
    totalSentimentSnapshots: Int!
    usersByRole: JSON!
  }

  type Query {
    me: User
    creatorOverview(creatorId: ID!): CreatorOverview
    creatorProfile(creatorId: ID!): CreatorProfile
    myCreatorProfile: CreatorProfile
    mySubscriptions: [SubscriberProfile!]!
    contentItems(creatorId: ID!, filter: ContentFilterInput): [ContentItem!]!
    sentimentSnapshots(creatorId: ID!, filter: SentimentFilterInput): [SentimentSnapshot!]!
    ideaSuggestions(creatorId: ID!, filter: IdeaFilterInput): [IdeaSuggestion!]!
    subscribers(creatorId: ID!, filter: SubscriberFilterInput): [SubscriberProfile!]!
    subscriptionTiers(creatorId: ID!): [SubscriptionTier!]!
    commentBatch(id: ID!): CommentBatch
    commentBatches(creatorId: ID!): [CommentBatch!]!
    # Admin queries
    allUsers: [User!]!
    allCreators: [CreatorProfile!]!
    platformStats: PlatformStats!
    allContentItems: [ContentItem!]!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createCreatorProfile(displayName: String!, bio: String, primaryPlatform: String!, niche: String!): CreatorProfile!
    updateCreatorProfile(id: ID!, displayName: String, bio: String, niche: String): CreatorProfile!
    createSubscriptionTier(creatorId: ID!, name: String!, pricePerMonth: Float!, benefits: [String!]): SubscriptionTier!
    updateSubscriptionTier(id: ID!, name: String, pricePerMonth: Float, benefits: [String!]): SubscriptionTier!
    createContentItem(creatorId: ID!, title: String!, type: String!, isPremium: Boolean, requiredTier: String, description: String, contentUrl: String, contentBody: String): ContentItem!
    updateContentItem(id: ID!, title: String, type: String, status: String): ContentItem!
    publishContentItem(id: ID!): ContentItem!
    deleteContentItem(id: ID!): Boolean!
    importCommentBatch(creatorId: ID!, source: String!, rawComments: [JSON!]!, linkedContentItemId: ID): CommentBatch!
    analyzeCommentBatch(batchId: ID!): SentimentSnapshot!
    generateIdeas(snapshotId: ID!, tierTarget: String): [IdeaSuggestion!]!
    createSubscriber(userId: ID!, creatorId: ID!, tier: String!): SubscriberProfile!
    # Admin mutations
    updateUser(id: ID!, name: String, email: String, role: String): User!
    deleteUser(id: ID!): Boolean!
    deleteCreatorProfile(id: ID!): Boolean!
    updateContentItemStatus(id: ID!, status: String!): ContentItem!
  }

  input ContentFilterInput {
    status: String
    type: String
    isPremium: Boolean
  }

  input SentimentFilterInput {
    startDate: Date
    endDate: Date
  }

  input IdeaFilterInput {
    status: String
    tierTarget: String
  }

  input SubscriberFilterInput {
    tier: String
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }
`
