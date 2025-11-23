import {
  LogIn,
  UserPlus,
  Users,
  FileText,
  TrendingUp,
  Lightbulb,
} from "lucide-react"

export const ACTIVITY_COLORS = {
  USER_LOGIN: "#3B82F6",
  USER_REGISTER: "#10B981",
  CREATOR_PROFILE_CREATED: "#8B5CF6",
  CONTENT_CREATED: "#F59E0B",
  CONTENT_PUBLISHED: "#EF4444",
  COMMENT_BATCH_IMPORTED: "#06B6D4",
  SENTIMENT_ANALYZED: "#EC4899",
  IDEAS_GENERATED: "#14B8A6",
  SUBSCRIBER_JOINED: "#6366F1",
} as const

export const ACTIVITY_ICONS: Record<string, any> = {
  USER_LOGIN: LogIn,
  USER_REGISTER: UserPlus,
  CREATOR_PROFILE_CREATED: Users,
  CONTENT_CREATED: FileText,
  CONTENT_PUBLISHED: FileText,
  COMMENT_BATCH_IMPORTED: TrendingUp,
  SENTIMENT_ANALYZED: TrendingUp,
  IDEAS_GENERATED: Lightbulb,
  SUBSCRIBER_JOINED: Users,
}

export const ACTIVITY_LABELS: Record<string, string> = {
  USER_LOGIN: "User Login",
  USER_REGISTER: "User Registration",
  CREATOR_PROFILE_CREATED: "Creator Profile Created",
  CREATOR_PROFILE_UPDATED: "Creator Profile Updated",
  CONTENT_CREATED: "Content Created",
  CONTENT_PUBLISHED: "Content Published",
  CONTENT_UPDATED: "Content Updated",
  CONTENT_DELETED: "Content Deleted",
  COMMENT_BATCH_IMPORTED: "Comment Batch Imported",
  SENTIMENT_ANALYZED: "Sentiment Analyzed",
  IDEAS_GENERATED: "Ideas Generated",
  SUBSCRIBER_JOINED: "Subscriber Joined",
}

