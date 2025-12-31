"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuthStore } from "../../hooks/use-auth-store"
import { ROLES } from "@engagement-nexus/config"
import { toast } from "../../hooks/use-toast"
import { Logo } from "../../components/logo"

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
    <main className="min-h-screen bg-paper-system flex items-center justify-center px-6 relative">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="block">
          <Logo showText={true} size="md" textGradient={true} />
        </Link>
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight" style={{ color: 'rgb(55, 65, 81)' }}>Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <div className="flex flex-col">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) validateEmail(e.target.value)
              }}
              onBlur={() => validateEmail(email)}
              placeholder="Email Address"
              className={`w-[320px] bg-white border-gray-300 text-foreground placeholder:text-gray-400 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${emailError ? "border-destructive" : ""}`}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p className="text-sm text-destructive mt-1 text-left" style={{ width: '320px' }}>
                {emailError}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) validatePassword(e.target.value)
              }}
              onBlur={() => validatePassword(password)}
              placeholder="Password"
              className={`w-[320px] bg-white border-gray-300 text-foreground placeholder:text-gray-400 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${passwordError ? "border-destructive" : ""}`}
              aria-invalid={!!passwordError}
            />
            {passwordError && (
              <p className="text-sm text-destructive mt-1 text-left" style={{ width: '320px' }}>
                {passwordError}
              </p>
            )}
          </div>

          <Link href="/forgot-password" className="block text-sm text-primary underline hover:text-primary/80 self-start">
            Forgot your password?
          </Link>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-destructive text-sm flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-destructive flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                </span>
                <span>{error}</span>
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-[320px] bg-primary text-white hover:bg-primary/90 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-11"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary underline hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
