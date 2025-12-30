"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import { BrandText } from '../../components/brand-text'
import { toast } from '../../hooks/use-toast'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, isLoading, error } = useAuthStore()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: searchParams.get("role") || ROLES.CREATOR,
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
  })

  const validateName = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "Full name is required" }))
      return false
    }
    if (value.trim().length < 2) {
      setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }))
      return false
    }
    setErrors(prev => ({ ...prev, name: "" }))
    return true
  }

  const validateEmail = (value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, email: "Email is required" }))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      return false
    }
    setErrors(prev => ({ ...prev, email: "" }))
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, password: "Password is required" }))
      return false
    }
    if (value.length < 8) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }))
      return false
    }
    if (!/(?=.*[a-z])/.test(value)) {
      setErrors(prev => ({ ...prev, password: "Password must contain at least one lowercase letter" }))
      return false
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      setErrors(prev => ({ ...prev, password: "Password must contain at least one uppercase letter" }))
      return false
    }
    if (!/(?=.*\d)/.test(value)) {
      setErrors(prev => ({ ...prev, password: "Password must contain at least one number" }))
      return false
    }
    setErrors(prev => ({ ...prev, password: "" }))
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const isNameValid = validateName(formData.name)
    const isEmailValid = validateEmail(formData.email)
    const isPasswordValid = validatePassword(formData.password)
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form",
      })
      return
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.role)
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      })
      
      router.push(formData.role === ROLES.CREATOR ? "/creator/onboarding" : "/subscriber/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again."
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      })
      console.error("Registration failed:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Full Name
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => validateName(formData.name)}
          placeholder="John Doe"
          className={`bg-slate-800 border-slate-700 text-white ${
            errors.name ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""
          }`}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <span>•</span>
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => validateEmail(formData.email)}
          placeholder="you@example.com"
          className={`bg-slate-800 border-slate-700 text-white ${
            errors.email ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""
          }`}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <span>•</span>
            <span>{errors.email}</span>
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
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => validatePassword(formData.password)}
          placeholder="At least 8 characters with uppercase, lowercase, and number"
          className={`bg-slate-800 border-slate-700 text-white ${
            errors.password ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""
          }`}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <span>•</span>
            <span>{errors.password}</span>
          </p>
        )}
        {!errors.password && formData.password && (
          <p className="mt-1.5 text-sm text-green-400 flex items-center gap-1">
            <span>✓</span>
            <span>Password looks good!</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[lab(33_35.57_-75.79)] focus:border-transparent"
        >
          <option value={ROLES.CREATOR}>Content Creator</option>
          <option value={ROLES.SUBSCRIBER_T1}>Subscriber (Tier 1)</option>
          <option value={ROLES.SUBSCRIBER_T2}>Subscriber (Tier 2)</option>
          <option value={ROLES.SUBSCRIBER_T3}>Subscriber (Tier 3)</option>
        </select>
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
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Log in
        </Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Join <BrandText size="3xl" className="inline" />
          </h1>
          <p className="text-slate-400">Create your account to get started</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
