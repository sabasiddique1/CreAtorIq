"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../../../hooks/use-auth-store"
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { graphqlQuery } from "../../../../lib/graphql"
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react"
import { toast } from "../../../../hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import type { CreatorProfile, SubscriptionTier } from "../../../../types"

interface CreatorPublicProfile {
  creator: CreatorProfile
  subscriptionTiers: SubscriptionTier[]
  subscriberCount: number
  recentContent: any[]
  isSubscribed: boolean
  currentTier: string | null
}

export default function SubscribePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const creatorId = params.creatorId as string
  const selectedTierName = searchParams.get("tier") || ""
  const { user, checkAuth, logout } = useAuthStore()
  const [profile, setProfile] = useState<CreatorPublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)

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

  useEffect(() => {
    if (profile && selectedTierName) {
      const tier = profile.subscriptionTiers.find((t) => t.name === selectedTierName)
      if (tier) {
        setSelectedTier(tier)
      }
    }
  }, [profile, selectedTierName])

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true)
      const result = await graphqlQuery(
        `
        query CreatorPublicProfile($creatorId: ID!) {
          creatorPublicProfile(creatorId: $creatorId) {
            creator {
              _id
              displayName
              bio
              niche
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
            }
            isSubscribed
            currentTier
          }
        }
      `,
        { creatorId }
      )

      if (result?.creatorPublicProfile) {
        setProfile(result.creatorPublicProfile)
        if (!selectedTierName && result.creatorPublicProfile.subscriptionTiers.length > 0) {
          setSelectedTier(result.creatorPublicProfile.subscriptionTiers[0])
        }
      }
    } catch (error: any) {
      console.error("Error fetching creator profile:", error)
      toast({
        title: "Error",
        description: "Failed to load creator profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedTier || !user) return

    try {
      setSubscribing(true)

      // For now, create subscription without payment
      // TODO: Integrate Stripe payment processing
      const result = await graphqlQuery(
        `
        mutation CreateSubscriber($creatorId: ID!, $tier: String!) {
          createSubscriber(creatorId: $creatorId, tier: $tier) {
            _id
            creatorId
            tier
            joinedAt
          }
        }
      `,
        {
          creatorId,
          tier: selectedTier.name,
        }
      )

      if (result?.createSubscriber) {
        toast({
          title: "Success!",
          description: `You've successfully subscribed to ${profile?.creator.displayName} at ${selectedTier.name} tier!`,
        })
        router.push(`/subscriber/creator/${creatorId}`)
      }
    } catch (error: any) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }


  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
        <SubscriberNavbar />
        <div className="flex-1 overflow-y-auto pt-16 flex items-center justify-center">
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile || !selectedTier) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
        <SubscriberNavbar />
        <div className="flex-1 overflow-y-auto pt-16 flex items-center justify-center">
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-slate-400">Creator or tier not found</p>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/subscriber/creator/${creatorId}`)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscribe to {profile.creator.displayName}</h1>
          <p className="text-slate-400 mb-8">Complete your subscription to access exclusive content</p>

          {/* Selected Tier */}
          <div className="mb-8 p-6 bg-slate-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedTier.name}</h2>
                <p className="text-4xl font-bold text-blue-400">${selectedTier.pricePerMonth}</p>
                <p className="text-sm text-slate-400">per month</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/subscriber/creator/${creatorId}`)}
                className="border-slate-600"
              >
                Change Plan
              </Button>
            </div>

            {selectedTier.benefits && selectedTier.benefits.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">What's included:</p>
                <ul className="space-y-2">
                  {selectedTier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Payment Info - Placeholder for Stripe */}
          <div className="mb-8 p-6 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Payment Information</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Payment processing will be integrated with Stripe. For now, subscription will be created without payment verification.
            </p>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-yellow-400 text-sm">
                ⚠️ Note: This is a demo subscription. Stripe payment integration will be added in the next phase.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 p-6 bg-slate-900/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Creator</span>
                <span className="text-white font-medium">{profile.creator.displayName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tier</span>
                <span className="text-white font-medium">{selectedTier.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Price</span>
                <span className="text-white font-medium">${selectedTier.pricePerMonth}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between text-white font-semibold">
                <span>Total</span>
                <span>${selectedTier.pricePerMonth}/month</span>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <Button
            className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white text-lg py-6"
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? "Processing..." : `Subscribe for $${selectedTier.pricePerMonth}/month`}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By subscribing, you agree to our terms of service. You can cancel anytime.
          </p>
        </Card>
        </div>
      </div>
    </div>
  )
}

