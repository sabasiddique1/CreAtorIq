import { API_BASE_URL } from "@engagement-nexus/config"

export async function graphqlQuery(query: string, variables?: Record<string, any>) {
  console.log("[GraphQL] Making request to:", `${API_BASE_URL}/graphql`)
  console.log("[GraphQL] Query:", query.substring(0, 100) + "...")
  console.log("[GraphQL] Variables:", variables)
  
  try {
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query, variables }),
    })

    console.log("[GraphQL] Response status:", response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[GraphQL] Response not OK:", errorText)
      throw new Error(`Network error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[GraphQL] Response data:", data)
    
    if (data.errors) {
      const errorMessage = data.errors[0]?.message || "GraphQL error"
      console.error("[GraphQL] GraphQL errors:", data.errors)
      const error = new Error(errorMessage)
      ;(error as any).graphqlErrors = data.errors
      throw error
    }
    
    return data.data
  } catch (error) {
    console.error("[GraphQL] Request failed:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("[GraphQL] Network error - API might be unreachable. API_BASE_URL:", API_BASE_URL)
      throw new Error(`Cannot connect to server. Please check your connection and try again.`)
    }
    throw error
  }
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
