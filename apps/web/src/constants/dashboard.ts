import { Users, BarChart3, FileText, MessageSquare, Lightbulb } from "lucide-react"

export const ADMIN_STATS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    iconColor: "text-blue-400",
  },
  {
    key: "totalCreators",
    label: "Creators",
    icon: BarChart3,
    iconColor: "text-purple-400",
  },
  {
    key: "totalSubscribers",
    label: "Subscribers",
    icon: Users,
    iconColor: "text-emerald-400",
  },
  {
    key: "totalContentItems",
    label: "Content Items",
    icon: FileText,
    iconColor: "text-yellow-400",
  },
  {
    key: "totalCommentBatches",
    label: "Comment Batches",
    icon: MessageSquare,
    iconColor: "text-cyan-400",
  },
  {
    key: "totalSentimentSnapshots",
    label: "Sentiment Snapshots",
    icon: Lightbulb,
    iconColor: "text-orange-400",
  },
] as const

export const ANALYTICS_METRICS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    iconColor: "text-blue-400",
  },
  {
    key: "totalCreators",
    label: "Active Creators",
    icon: BarChart3,
    iconColor: "text-purple-400",
  },
  {
    key: "totalSubscribers",
    label: "Total Subscribers",
    icon: Users,
    iconColor: "text-emerald-400",
  },
  {
    key: "totalContentItems",
    label: "Content Items",
    icon: FileText,
    iconColor: "text-yellow-400",
  },
  {
    key: "totalCommentBatches",
    label: "Comment Batches",
    icon: MessageSquare,
    iconColor: "text-cyan-400",
  },
  {
    key: "totalSentimentSnapshots",
    label: "Sentiment Snapshots",
    icon: Lightbulb,
    iconColor: "text-orange-400",
  },
] as const

