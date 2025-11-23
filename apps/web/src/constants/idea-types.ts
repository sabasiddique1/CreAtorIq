import { Video, BookOpen, MessageCircle, Target, Lightbulb } from "lucide-react"

export const IDEA_TYPE_ICONS: Record<string, any> = {
  video: Video,
  "mini-course": BookOpen,
  live_qa: MessageCircle,
  community_challenge: Target,
  default: Lightbulb,
}

export const IDEA_TYPE_LABELS: Record<string, string> = {
  video: "Video",
  "mini-course": "Mini Course",
  live_qa: "Live Q&A",
  community_challenge: "Community Challenge",
}

export const IDEA_STATUS_LABELS: Record<string, string> = {
  new: "New",
  saved: "Saved",
  implemented: "Implemented",
}

export const IDEA_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-700/30 text-blue-300 border-blue-700/50",
  saved: "bg-yellow-700/30 text-yellow-300 border-yellow-700/50",
  implemented: "bg-green-700/30 text-green-300 border-green-700/50",
}

