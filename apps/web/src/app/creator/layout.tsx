"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import { toast } from '../../hooks/use-toast'
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
import { Logo } from "../../components/logo"
import { CommandPalette } from "../../components/creator/command-palette"

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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // On mobile, when menu opens, ensure sidebar is expanded
  useEffect(() => {
    if (mobileMenuOpen) {
      // On mobile, always show expanded sidebar
      setSidebarCollapsed(false)
    }
  }, [mobileMenuOpen])

  // Keyboard shortcut for command palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      // First, check if user exists in persisted store (from localStorage)
      const currentUser = useAuthStore.getState().user
      
      if (currentUser) {
        // User exists in store - set auth checked immediately
        // This prevents redirect loop if cookies aren't ready yet
        setAuthChecked(true)
        
        // Check auth from server in background (non-blocking)
        // This will refresh the user data if cookies are now available
        setTimeout(() => {
          checkAuth().catch((error) => {
            console.warn("Background auth check failed (non-critical):", error)
            // Don't clear user on background check failure
          })
        }, 500) // Wait 500ms for cookies to be set
        
        return
      }
      
      // No user in store - check from server
      // Add retry logic for cookie timing issues
      let retries = 3
      while (retries > 0) {
        try {
          await checkAuth()
          const userAfterCheck = useAuthStore.getState().user
          if (userAfterCheck) {
            setAuthChecked(true)
            return
          }
        } catch (error) {
          console.warn(`Auth check attempt ${4 - retries} failed:`, error)
        }
        
        retries--
        if (retries > 0) {
          // Wait before retry (cookies might need time to be set)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      // All retries failed - set auth checked anyway
      setAuthChecked(true)
    }
    initAuth()
  }, [checkAuth])

  useEffect(() => {
    // Only redirect if we've checked auth AND there's definitely no user
    // Don't redirect on initial load if user exists in store
    if (authChecked) {
      if (user && user.role !== ROLES.CREATOR) {
        router.push("/")
      } else if (!user) {
        // Only redirect if we've actually checked and confirmed no user
        // Give more time to allow store to hydrate and cookies to be available
        const timeout = setTimeout(() => {
          const currentUser = useAuthStore.getState().user
          if (!currentUser) {
            // Double check one more time after a longer delay
            setTimeout(() => {
              const finalCheck = useAuthStore.getState().user
              if (!finalCheck) {
                router.push("/login")
              }
            }, 500)
          }
        }, 300)
        return () => clearTimeout(timeout)
      }
    }
  }, [user, router, authChecked])

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static h-screen left-0 z-50
          bg-background/80 backdrop-blur-md border-r border-border/30
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "w-64" : sidebarCollapsed && !mobileMenuOpen ? "w-16 lg:w-16" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <Link href="/creator/dashboard">
                <Logo showText={true} size="md" />
              </Link>
            )}
            {sidebarCollapsed && !mobileMenuOpen && (
              <div className="flex justify-center w-full">
                <Logo size="md" />
              </div>
            )}
            <button
              onClick={() => {
                // Only allow collapse on desktop (lg screens)
                if (window.innerWidth >= 1024) {
                  setSidebarCollapsed(!sidebarCollapsed)
                }
              }}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed && !mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>


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
                    flex items-center rounded-md transition-all
                    ${(sidebarCollapsed && !mobileMenuOpen)
                      ? "justify-center px-2 py-2.5" 
                      : "gap-3 px-3 py-2.5"
                    }
                    ${isActive
                      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                  {(!sidebarCollapsed || mobileMenuOpen) && <span className="text-sm">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border/50">
            {(!sidebarCollapsed || mobileMenuOpen) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/30 shadow-lg">
                  <DropdownMenuLabel className="text-foreground">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild>
                    <Link href="/creator/settings" className="flex items-center gap-2 text-foreground hover:text-foreground cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive hover:text-destructive cursor-pointer"
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
                    <Avatar className="w-9 h-9">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/30 shadow-lg">
                  <DropdownMenuLabel className="text-foreground">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild>
                    <Link href="/creator/settings" className="flex items-center gap-2 text-foreground hover:text-foreground cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive hover:text-destructive cursor-pointer"
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 h-screen flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-border/30 bg-background/60 backdrop-blur-sm">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                onClick={() => setCommandPaletteOpen(true)}
                placeholder="Search pages, actions..."
                readOnly
                className="pl-9 pr-20 bg-background border-border text-foreground text-sm h-10 cursor-pointer hover:border-primary/30 transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30 p-4 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/creator/dashboard" className="shrink-0">
            <Logo showText={true} size="sm" textGradient={true} />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              onClick={() => setCommandPaletteOpen(true)}
              placeholder="Search..."
              readOnly
              className="pl-9 bg-background border-border text-foreground text-sm h-9 cursor-pointer hover:border-primary/30 transition-colors"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/30 shadow-lg">
              <DropdownMenuLabel className="text-foreground">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem asChild>
                <Link href="/creator/settings" className="flex items-center gap-2 text-foreground hover:text-foreground cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive hover:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={`pt-16 lg:pt-0 transition-all duration-300 flex-1 overflow-y-auto bg-slate-950`}>
          <div className="p-4 sm:p-6 lg:p-8 h-full">{children}</div>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  )
}
