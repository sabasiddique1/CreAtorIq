"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreatorHeader from '../../components/creator/header'
import { useAuthStore } from '../../hooks/use-auth-store'
import { ROLES } from "@engagement-nexus/config"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, checkAuth, isLoading } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setAuthChecked(true)
    }
    initAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authChecked && user && user.role !== ROLES.CREATOR) {
      router.push("/")
    }
    if (authChecked && !user) {
      router.push("/login")
    }
  }, [user, router, authChecked])

  if (!authChecked || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <CreatorHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
