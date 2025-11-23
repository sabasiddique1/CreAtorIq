import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Activity,
  UserCircle,
  Lightbulb,
  MessageSquare,
} from "lucide-react"

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/creators", label: "Creators", icon: UserCircle },
  { href: "/admin/content", label: "Content Moderation", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const

export const CREATOR_NAV_ITEMS = [
  { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/audience", label: "Audience", icon: Users },
  { href: "/creator/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/creator/content", label: "Content", icon: FileText },
] as const

