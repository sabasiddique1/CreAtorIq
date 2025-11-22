"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuthStore } from "../../hooks/use-auth-store"
import { ROLES } from "@engagement-nexus/config"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      if (user?.role === ROLES.ADMIN) {
        router.push("/admin")
      } else if (user?.role === ROLES.CREATOR) {
        router.push("/creator/dashboard")
      } else {
        router.push("/subscriber/dashboard")
      }
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Log in to your CreatorIQ account</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <Button type="submit" disabled={isLoading} className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90">
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            <p className="text-center text-slate-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
