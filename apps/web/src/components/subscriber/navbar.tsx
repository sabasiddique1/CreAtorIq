"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../../hooks/use-auth-store"
import { Button } from "../ui/button"
import { Logo } from "../logo"
import { Home, Search, User, LogOut, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/subscriber/dashboard", label: "My Library", icon: Home },
  { href: "/subscriber/discover", label: "Discover", icon: Search },
  { href: "/subscriber/account", label: "Account", icon: User },
]

export function SubscriberNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const userTier = user?.role.replace("SUBSCRIBER_", "") || ""

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      T1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      T2: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      T3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    }
    return colors[tier] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/subscriber/dashboard" className="flex items-center gap-2 group">
              <Logo showText={true} size="md" className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "")} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side - User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* Tier Badge */}
            {userTier && (
              <div className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold",
                getTierColor(userTier)
              )}>
                <Sparkles className="w-3 h-3" />
                <span>{userTier}</span>
              </div>
            )}

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {user?.name || "User"}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-700/50 bg-slate-800/30">
        <nav className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all",
                  isActive
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

