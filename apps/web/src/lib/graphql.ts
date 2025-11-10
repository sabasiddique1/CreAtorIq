import { API_BASE_URL } from "@engagement-nexus/config"

export async function graphqlQuery(query: string, variables?: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  })

  const data = await response.json()
  if (data.errors) {
    throw new Error(data.errors[0].message)
  }
  return data.data
}

export const GET_CREATOR_OVERVIEW = `
  query CreatorOverview($creatorId: ID!) {
    creatorOverview(creatorId: $creatorId) {
      creator {
        _id
        displayName
        bio
        niche
        primaryPlatform
      }
      totalSubscribers
      subscribersByTier
      recentContent {
        _id
        title
        type
        status
        isPremium
        createdAt
      }
      latestSentimentTrend {
        overallSentimentScore
        positiveCount
        negativeCount
        neutralCount
        topKeywords
      }
    }
  }
`

export const GET_CONTENT_ITEMS = `
  query ContentItems($creatorId: ID!, $filter: ContentFilterInput) {
    contentItems(creatorId: $creatorId, filter: $filter) {
      _id
      title
      type
      status
      isPremium
      requiredTier
      createdAt
    }
  }
`

export const GET_SENTIMENT_SNAPSHOTS = `
  query SentimentSnapshots($creatorId: ID!, $filter: SentimentFilterInput) {
    sentimentSnapshots(creatorId: $creatorId, filter: $filter) {
      _id
      overallSentimentScore
      positiveCount
      negativeCount
      neutralCount
      topKeywords
      topRequests
      timeRangeStart
      timeRangeEnd
    }
  }
`

export const GET_IDEA_SUGGESTIONS = `
  query IdeaSuggestions($creatorId: ID!, $filter: IdeaFilterInput) {
    ideaSuggestions(creatorId: $creatorId, filter: $filter) {
      _id
      title
      description
      ideaType
      tierTarget
      status
      outline
      createdAt
    }
  }
`

export const CREATE_CONTENT_ITEM = `
  mutation CreateContentItem(
    $creatorId: ID!
    $title: String!
    $type: String!
    $isPremium: Boolean
    $requiredTier: String
    $description: String
  ) {
    createContentItem(
      creatorId: $creatorId
      title: $title
      type: $type
      isPremium: $isPremium
      requiredTier: $requiredTier
      description: $description
    ) {
      _id
      title
      status
    }
  }
`

export const IMPORT_COMMENT_BATCH = `
  mutation ImportCommentBatch(
    $creatorId: ID!
    $source: String!
    $rawComments: [JSON!]!
    $linkedContentItemId: ID
  ) {
    importCommentBatch(
      creatorId: $creatorId
      source: $source
      rawComments: $rawComments
      linkedContentItemId: $linkedContentItemId
    ) {
      _id
      importedAt
    }
  }
`

export const ANALYZE_COMMENT_BATCH = `
  mutation AnalyzeCommentBatch($batchId: ID!) {
    analyzeCommentBatch(batchId: $batchId) {
      _id
      overallSentimentScore
      positiveCount
      negativeCount
      topKeywords
    }
  }
`

export const GENERATE_IDEAS = `
  mutation GenerateIdeas($snapshotId: ID!, $tierTarget: String) {
    generateIdeas(snapshotId: $snapshotId, tierTarget: $tierTarget) {
      _id
      title
      description
      ideaType
      outline
    }
  }
`
