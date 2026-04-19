"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import { toast } from '../../hooks/use-toast'
import {
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { ADMIN_NAV_ITEMS } from "../../constants"
import { Logo } from "../../components/logo"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      // Small delay to show toast before redirect
      setTimeout(() => {
        window.location.href = "/login"
      }, 300)
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even if toast fails
      window.location.href = "/login"
    }
  }

  if (!user || user.role !== ROLES.ADMIN) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-paper-system">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between">
        <Logo size="md" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static h-screen left-0 z-40
          w-64 bg-white/80 backdrop-blur-md border-r border-gray-200
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          transition-transform duration-200 ease-in-out
          pt-16 lg:pt-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <Link href="/admin">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-gray-600 mt-2">Platform Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {ADMIN_NAV_ITEMS.map((item) => {
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
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="text-gray-900 font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
      <main className="flex-1 lg:ml-0 h-screen flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-16 lg:pt-0 bg-paper-system">{children}</div>
      </main>
    </div>
  )
}

