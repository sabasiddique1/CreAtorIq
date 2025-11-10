"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useAuthStore } from "../../hooks/use-auth-store"
import { LogOut, Settings } from "lucide-react"

export default function CreatorHeader() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/creator/dashboard" className="text-xl font-bold text-blue-400">
          Engagement Nexus
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/creator/dashboard" className="text-slate-300 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/creator/audience" className="text-slate-300 hover:text-white transition">
            Audience
          </Link>
          <Link href="/creator/ideas" className="text-slate-300 hover:text-white transition">
            Ideas
          </Link>
          <Link href="/creator/content" className="text-slate-300 hover:text-white transition">
            Content
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/creator/settings">
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
