"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../../../hooks/use-auth-store"
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { graphqlQuery } from "../../../../lib/graphql"
import { ArrowLeft, CheckCircle2, Star, Users } from "lucide-react"
import { toast } from "../../../../hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import type { CreatorProfile, SubscriptionTier, ContentItem } from "../../../../types"

interface CreatorPublicProfile {
  creator: CreatorProfile
  subscriptionTiers: SubscriptionTier[]
  subscriberCount: number
  recentContent: ContentItem[]
  isSubscribed: boolean
  currentTier: string | null
}

export default function CreatorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const creatorId = params.creatorId as string
  const { user, checkAuth, logout } = useAuthStore()
  const [profile, setProfile] = useState<CreatorPublicProfile | null>(null)
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
    if (creatorId && user) {
      fetchCreatorProfile()
    }
  }, [creatorId, user])

  const fetchCreatorProfile = async () => {
    if (!creatorId) {
      console.error("No creatorId provided")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("Fetching creator profile for ID:", creatorId)
      
      const result = await graphqlQuery(
        `
        query CreatorPublicProfile($creatorId: ID!) {
          creatorPublicProfile(creatorId: $creatorId) {
            creator {
              _id
              displayName
              bio
              niche
              avatarUrl
              primaryPlatform
            }
            subscriptionTiers {
              _id
              name
              pricePerMonth
              benefits
            }
            subscriberCount
            recentContent {
              _id
              title
              type
              isPremium
              requiredTier
              description
              createdAt
            }
            isSubscribed
            currentTier
          }
        }
      `,
        { creatorId: String(creatorId) }
      )

      if (result?.creatorPublicProfile) {
        setProfile(result.creatorPublicProfile)
      } else {
        console.error("No creator profile returned:", result)
        toast({
          title: "Error",
          description: "Creator profile not found.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching creator profile:", error)
      const errorMessage = error?.message || "Failed to load creator profile. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const handleSubscribe = (tier: SubscriptionTier) => {
    router.push(`/subscriber/subscribe/${creatorId}?tier=${tier.name}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
        <SubscriberNavbar />
        <div className="flex-1 overflow-y-auto pt-16 flex items-center justify-center">
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-slate-400">Creator not found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/subscriber/discover")}
              className="mt-4"
            >
              Back to Discover
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
      <SubscriberNavbar />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/subscriber/discover")}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover
        </Button>

        {/* Creator Info */}
        <Card className="bg-slate-800/50 border-slate-700 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-[lab(33_35.57_-75.79)] flex items-center justify-center text-white text-2xl font-bold">
              {profile.creator.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.creator.displayName}</h1>
                {profile.isSubscribed && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Subscribed {profile.currentTier && `(${profile.currentTier})`}
                  </span>
                )}
              </div>
              <p className="text-slate-400 mb-2">{profile.creator.niche}</p>
              <p className="text-slate-300">{profile.creator.bio}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{profile.subscriberCount} subscribers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{profile.recentContent.length} recent content</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscription Tiers */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Subscription Tiers</h2>
            <div className="space-y-4">
              {profile.subscriptionTiers.map((tier) => (
                <Card
                  key={tier._id}
                  className="bg-slate-800/50 border-slate-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                      <p className="text-3xl font-bold text-blue-400">${tier.pricePerMonth}</p>
                      <p className="text-sm text-slate-400">per month</p>
                    </div>
                    {profile.isSubscribed && profile.currentTier === tier.name && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>

                  {tier.benefits && tier.benefits.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2">
                    {profile.isSubscribed && (
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300"
                        onClick={() => router.push(`/subscriber/creator/${creatorId}/content`)}
                      >
                        View Content
                      </Button>
                    )}
                    <Button
                      className={`${profile.isSubscribed ? "flex-1" : "w-full"} bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white`}
                      onClick={() => handleSubscribe(tier)}
                      disabled={profile.isSubscribed && profile.currentTier === tier.name}
                    >
                      {profile.isSubscribed && profile.currentTier === tier.name
                        ? "Current Plan"
                        : profile.isSubscribed
                        ? "Change Plan"
                        : "Subscribe"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Content Preview */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Content</h2>
            {profile.recentContent.length > 0 ? (
              <div className="space-y-4">
                {profile.recentContent.map((content) => (
                  <Card
                    key={content._id}
                    className="bg-slate-800/50 border-slate-700 p-4"
                  >
                    <h3 className="text-white font-semibold mb-1">{content.title}</h3>
                    <p className="text-sm text-slate-400 mb-2 capitalize">{content.type}</p>
                    {content.isPremium && (
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                        {content.requiredTier} Only
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <p className="text-slate-400">No content available yet</p>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

