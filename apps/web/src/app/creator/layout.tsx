"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Input } from "../../components/ui/input"

const navItems = [
  { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/audience", label: "Audience", icon: Users },
  { href: "/creator/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/creator/content", label: "Content", icon: FileText },
]

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, checkAuth, isLoading, logout } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setAuthChecked(true)
    }
    initAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authChecked && user && user.role !== ROLES.CREATOR) {
      router.push("/")
    }
    if (authChecked && !user) {
      router.push("/login")
    }
  }, [user, router, authChecked])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!authChecked || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-slate-900 border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-16" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link href="/creator/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CI</span>
                </div>
                <span className="text-xl font-bold text-white">CreatorIQ</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-slate-800 border-slate-700 text-white text-sm h-9"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors
                    ${isActive
                      ? "bg-[lab(33_35.57_-75.79)] text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            {!sidebarCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-[lab(33_35.57_-75.79)] text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/creator/settings" className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-[lab(33_35.57_-75.79)] text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/creator/settings" className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/creator/dashboard" className="text-xl font-bold text-blue-400">
            CreatorIQ
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-[lab(33_35.57_-75.79)] text-white text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
              <DropdownMenuLabel className="text-white">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem asChild>
                <Link href="/creator/settings" className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={`pt-16 lg:pt-0 transition-all duration-300`}>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
