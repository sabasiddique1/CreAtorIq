"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  UserCircle,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/creators", label: "Creators", icon: UserCircle },
  { href: "/admin/content", label: "Content Moderation", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (!user || user.role !== ROLES.ADMIN) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 border-r border-slate-800
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          transition-transform duration-200 ease-in-out
          pt-16 lg:pt-0
        `}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-800 hidden lg:block">
              <h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1>
              <p className="text-sm text-slate-400 mt-1">Platform Management</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors
                      ${
                        isActive
                          ? "bg-[lab(33_35.57_-75.79)] text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="mb-4 px-4 py-2 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="pt-16 lg:pt-0">{children}</div>
        </main>
      </div>
    </div>
  )
}

