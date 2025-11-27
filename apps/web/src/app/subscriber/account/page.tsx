"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { graphqlQuery } from "../../../lib/graphql"
import { CreditCard, Users, Settings, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "../../../hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import type { SubscriberProfile } from "../../../types"
import { TIER_COLORS } from "../../../constants"

export default function AccountPage() {
  const router = useRouter()
  const { user, checkAuth, logout } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<SubscriberProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && !user.role.includes("SUBSCRIBER")) {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const result = await graphqlQuery(`
        query {
          mySubscriptions {
            _id
            creatorId
            tier
            joinedAt
            creator {
              _id
              displayName
              niche
            }
          }
        }
      `)

      if (result?.mySubscriptions) {
        setSubscriptions(result.mySubscriptions)
      }
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const getTierColor = (tier: string) => {
    return TIER_COLORS[tier as keyof typeof TIER_COLORS] || "bg-slate-500/20 text-slate-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
      <SubscriberNavbar />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account & Billing</h1>
          <p className="text-slate-400">Manage your subscriptions and account settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Subscriptions */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Subscriptions
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/subscriber/discover")}
                  className="border-slate-600"
                >
                  Discover More
                </Button>
              </div>

              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub) => {
                    const creatorId = typeof sub.creatorId === "object"
                      ? (sub.creator?._id || sub.creatorId?._id || sub.creatorId)
                      : sub.creatorId

                    return (
                      <div
                        key={sub._id}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {sub.creator?.displayName || "Unknown Creator"}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${getTierColor(sub.tier)}`}>
                                {sub.tier}
                              </span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            </div>
                            {sub.creator?.niche && (
                              <p className="text-sm text-slate-400 mb-2">{sub.creator.niche}</p>
                            )}
                            <p className="text-xs text-slate-500">
                              Subscribed since {new Date(sub.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/subscriber/creator/${creatorId}/content`)}
                            className="flex-1 border-slate-600 text-slate-300"
                          >
                            View Content
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/subscriber/creator/${creatorId}`)}
                            className="flex-1 border-slate-600 text-slate-300"
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">You don't have any active subscriptions yet.</p>
                  <Button
                    className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white"
                    onClick={() => router.push("/subscriber/discover")}
                  >
                    Discover Creators
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment Methods - Placeholder */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </h2>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Payment method management will be available after Stripe integration.
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Info
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Default Tier</p>
                  <p className="text-white font-medium">
                    {user?.role.replace("SUBSCRIBER_", "") || "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300"
                  onClick={() => router.push("/subscriber/discover")}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Discover Creators
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300"
                  onClick={() => router.push("/subscriber/dashboard")}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  My Library
                </Button>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

