"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuthStore } from "../../hooks/use-auth-store"
import { ROLES } from "@engagement-nexus/config"
import { BrandText } from "../../components/brand-text"
import { toast } from "../../hooks/use-toast"

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required")
      return false
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form",
      })
      return
    }

    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      
      if (user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        })
        
        // Wait for Zustand persist to save user to localStorage
        // This ensures the user is available when the new page loads
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Use window.location.href for hard navigation
        // This ensures cookies are available and prevents layout auth check race condition
        if (user.role === ROLES.ADMIN) {
          window.location.href = "/admin"
        } else if (user.role === ROLES.CREATOR) {
          window.location.href = "/creator/dashboard"
        } else {
          window.location.href = "/subscriber/dashboard"
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      })
      console.error("Login failed:", err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Log in to your <BrandText size="md" className="inline" /> account
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
                <span className="text-red-400 ml-1">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                placeholder="you@example.com"
                className={`bg-slate-800 border-slate-700 text-white ${
                  emailError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""
                }`}
                aria-invalid={!!emailError}
              />
              {emailError && (
                <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <span>•</span>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
                <span className="text-red-400 ml-1">*</span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={() => validatePassword(password)}
                placeholder="Your password"
                className={`bg-slate-800 border-slate-700 text-white ${
                  passwordError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""
                }`}
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <span>•</span>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span>⚠</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white disabled:opacity-50 disabled:cursor-not-allowed">
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
