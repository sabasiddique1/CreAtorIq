"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData.email, formData.password, formData.name, formData.role)
      router.push(formData.role === ROLES.CREATOR ? "/creator/onboarding" : "/subscriber/dashboard")
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          minLength={8}
          required
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
        >
          <option value={ROLES.CREATOR}>Content Creator</option>
          <option value={ROLES.SUBSCRIBER_T1}>Subscriber (Tier 1)</option>
          <option value={ROLES.SUBSCRIBER_T2}>Subscriber (Tier 2)</option>
          <option value={ROLES.SUBSCRIBER_T3}>Subscriber (Tier 3)</option>
        </select>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
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
          <h1 className="text-3xl font-bold text-white mb-2">Join Engagement Nexus</h1>
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
