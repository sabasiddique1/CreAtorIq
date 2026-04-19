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
  new: "bg-blue-100 text-blue-700 border-blue-200 font-medium",
  saved: "bg-yellow-100 text-yellow-700 border-yellow-200 font-medium",
  implemented: "bg-emerald-100 text-emerald-700 border-emerald-200 font-medium",
}

