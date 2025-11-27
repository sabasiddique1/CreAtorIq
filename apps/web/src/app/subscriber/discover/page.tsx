"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { graphqlQuery } from "../../../lib/graphql"
import { Search, Users, CheckCircle2 } from "lucide-react"
import { toast } from "../../../hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import type { CreatorProfile, SubscriptionTier } from "../../../types"

interface DiscoverCreator {
  creator: CreatorProfile
  subscriberCount: number
  subscriptionTiers: SubscriptionTier[]
  recentContentCount: number
  isSubscribed: boolean
}

export default function DiscoverCreatorsPage() {
  const router = useRouter()
  const { user, checkAuth, logout } = useAuthStore()
  const [creators, setCreators] = useState<DiscoverCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNiche, setSelectedNiche] = useState<string>("")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && !user.role.includes("SUBSCRIBER")) {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    fetchCreators()
  }, [user, searchQuery, selectedNiche])

  const fetchCreators = async () => {
    if (!user || !user.role.includes("SUBSCRIBER")) return

    try {
      setLoading(true)
      const filter: any = {}
      if (searchQuery) filter.search = searchQuery
      if (selectedNiche) filter.niche = selectedNiche

      const result = await graphqlQuery(
        `
        query DiscoverCreators($filter: CreatorFilterInput) {
          discoverCreators(filter: $filter) {
            creator {
              _id
              displayName
              bio
              niche
              avatarUrl
              primaryPlatform
            }
            subscriberCount
            subscriptionTiers {
              _id
              name
              pricePerMonth
              benefits
            }
            recentContentCount
            isSubscribed
          }
        }
      `,
        { filter: Object.keys(filter).length > 0 ? filter : undefined }
      )

      if (result?.discoverCreators) {
        setCreators(result.discoverCreators)
      }
    } catch (error: any) {
      console.error("Error fetching creators:", error)
      toast({
        title: "Error",
        description: "Failed to load creators. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const niches = Array.from(new Set(creators.map((c) => c.creator.niche))).filter(Boolean)

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
      <SubscriberNavbar />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover Creators</h1>
          <p className="text-slate-400">Find and subscribe to creators you love</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by name, niche, or bio..."
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedNiche === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNiche("")}
              className={selectedNiche === "" ? "bg-blue-500" : "border-slate-600"}
            >
              All
            </Button>
            {niches.slice(0, 8).map((niche) => (
              <Button
                key={niche}
                variant={selectedNiche === niche ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNiche(niche)}
                className={selectedNiche === niche ? "bg-blue-500" : "border-slate-600"}
              >
                {niche}
              </Button>
            ))}
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading creators...</p>
          </div>
        ) : creators.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((item) => (
              <Card
                key={item.creator._id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-blue-500 transition flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{item.creator.displayName}</h3>
                      <p className="text-sm text-slate-400 mb-2">{item.creator.niche}</p>
                    </div>
                    {item.isSubscribed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{item.creator.bio}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{item.subscriberCount} subscribers</span>
                    </div>
                    <span>•</span>
                    <span>{item.recentContentCount} content items</span>
                  </div>

                  {/* Subscription Tiers */}
                  <div className="mb-4 space-y-2">
                    {item.subscriptionTiers.slice(0, 3).map((tier) => (
                      <div
                        key={tier._id}
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-sm"
                      >
                        <span className="text-slate-300 font-medium">{tier.name}</span>
                        <span className="text-blue-400 font-semibold">${tier.pricePerMonth}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white"
                  onClick={() => router.push(`/subscriber/creator/${item.creator._id}`)}
                >
                  {item.isSubscribed ? "View Profile" : "View & Subscribe"}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No creators found. Try adjusting your search.</p>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}

