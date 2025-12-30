"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useAuthStore } from "../../hooks/use-auth-store"
import { toast } from "../../hooks/use-toast"
import { LogOut, Settings, Home, Search } from "lucide-react"
import { BrandText } from "../brand-text"

export function SubscriberNavbar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    try {
      logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      // Small delay to show toast before redirect
      setTimeout(() => {
        window.location.href = "/"
      }, 300)
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/subscriber/dashboard">
          <BrandText size="xl" />
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/subscriber/dashboard" className="text-slate-300 hover:text-white transition">
            <Home className="w-4 h-4 inline mr-2" />
            Dashboard
          </Link>
          <Link href="/subscriber/discover" className="text-slate-300 hover:text-white transition">
            <Search className="w-4 h-4 inline mr-2" />
            Discover
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-400 hidden sm:inline">
              {user.name || user.email}
            </span>
          )}
          <Link href="/subscriber/settings">
            <Button variant="ghost" size="icon" className="text-slate-300">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}






