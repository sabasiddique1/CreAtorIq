"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"
import { toast } from '../../hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { Logo } from '../../components/logo'

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
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
      <div className="flex flex-col">
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => validateName(formData.name)}
          placeholder="Full Name"
          className={`w-[320px] bg-white border-gray-300 text-foreground placeholder:text-gray-400 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${errors.name ? "border-destructive" : ""}`}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1 text-left" style={{ width: '320px' }}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => validateEmail(formData.email)}
          placeholder="Email Address"
          className={`w-[320px] bg-white border-gray-300 text-foreground placeholder:text-gray-400 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${errors.email ? "border-destructive" : ""}`}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1 text-left" style={{ width: '320px' }}>
            {errors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => validatePassword(formData.password)}
          placeholder="Password"
          className={`w-[320px] bg-white border-gray-300 text-foreground placeholder:text-gray-400 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${errors.password ? "border-destructive" : ""}`}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1 text-left" style={{ width: '320px' }}>
            {errors.password}
          </p>
        )}
      </div>

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-[320px] bg-white border border-gray-300 text-foreground rounded-lg px-3 py-2.5 text-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      >
        <option value={ROLES.CREATOR}>Content Creator</option>
        <option value={ROLES.SUBSCRIBER_T1}>Subscriber (Tier 1)</option>
        <option value={ROLES.SUBSCRIBER_T2}>Subscriber (Tier 2)</option>
        <option value={ROLES.SUBSCRIBER_T3}>Subscriber (Tier 3)</option>
      </select>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p className="text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-[320px] bg-primary text-white hover:bg-primary/90 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-11"
      >
        {isLoading ? "Creating account..." : "Sign up"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline hover:text-primary/80">
          Log in
        </Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-paper-system flex items-center justify-center px-6 relative">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="block">
          <Logo showText={true} size="md" textGradient={true} />
        </Link>
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight" style={{ color: 'rgb(55, 65, 81)' }}>Create Account</h1>
          <p className="text-muted-foreground">Sign up to get started</p>
        </div>
        <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  )
}
