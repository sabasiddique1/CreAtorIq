"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip"
import { graphqlQuery } from "../../../lib/graphql"
import { Lock, Star, Calendar, ExternalLink, Play, GraduationCap, Newspaper, Radio, Sparkles, Users, Filter, X, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { toast } from "../../../hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import Link from "next/link"
import type { ContentItem, SubscriberProfile } from "../../../types"
import { TIER_COLORS, TIER_HIERARCHY, CONTENT_TYPE_ICONS } from "../../../constants"
import { getThumbnailWithFallback } from "../../../lib/thumbnails"

export default function SubscriberDashboard() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriberProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [filterCreator, setFilterCreator] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && !user.role.includes("SUBSCRIBER")) {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    const fetchSubscriberContent = async () => {
      if (!user || !user.role.includes("SUBSCRIBER")) return

      try {
        setLoading(true)
        // Get subscriber tier (T1, T2, or T3) - will be used in filtering below

        // Get all creators this user is subscribed to
        const subscriptionsResult = await graphqlQuery(`
          query {
            mySubscriptions {
              _id
              creatorId
              tier
              creator {
                _id
                displayName
                niche
              }
            }
          }
        `)

        if (subscriptionsResult?.mySubscriptions) {
          // Log subscriptions for debugging
          console.log("Subscriptions received:", subscriptionsResult.mySubscriptions)
          setSubscriptions(subscriptionsResult.mySubscriptions)
        }

        if (!subscriptionsResult?.mySubscriptions || subscriptionsResult.mySubscriptions.length === 0) {
          setContentItems([])
          setLoading(false)
          return
        }

        // For each subscribed creator, get their published content
        const contentPromises = subscriptionsResult.mySubscriptions.map(async (subscription: any) => {
          try {
            // Ensure creatorId is a string (not an object)
            let creatorId: string = ""
            if (subscription.creator?._id) {
              creatorId = typeof subscription.creator._id === "string" 
                ? subscription.creator._id 
                : String(subscription.creator._id)
            } else if (typeof subscription.creatorId === "string") {
              creatorId = subscription.creatorId
            } else if (subscription.creatorId) {
              creatorId = typeof subscription.creatorId === "object" && subscription.creatorId._id
                ? String(subscription.creatorId._id)
                : String(subscription.creatorId)
            }
            
            const contentResult = await graphqlQuery(
              `
              query ContentItems($creatorId: ID!, $filter: ContentFilterInput) {
                contentItems(creatorId: $creatorId, filter: $filter) {
                  _id
                  title
                  type
                  status
                  isPremium
                  requiredTier
                  description
                  contentUrl
                  contentBody
                  createdAt
                }
              }
            `,
              {
                creatorId: String(creatorId),
                filter: { status: "published" },
              }
            )

            if (contentResult?.contentItems) {
              // Filter content based on subscriber tier
              // T3 can access T1, T2, T3
              // T2 can access T1, T2
              // T1 can only access T1
              const tier = String(user.role || "").replace("SUBSCRIBER_", "")
              const accessibleTiers = TIER_HIERARCHY[tier] || []

              return contentResult.contentItems
                .map((item: ContentItem) => {
                  // Check if content is accessible
                  let isAccessible = true
                  let isLocked = false
                  
                  if (item.isPremium && item.requiredTier) {
                    isAccessible = accessibleTiers.includes(item.requiredTier)
                    isLocked = !isAccessible
                  }

                  return {
                    ...item,
                    creator: subscription.creator || undefined,
                    isAccessible,
                    isLocked,
                    subscriptionTier: subscription.tier,
                  }
                })
            }
            return []
          } catch (error) {
            console.error(`Error fetching content for creator ${subscription.creatorId}:`, error)
            return []
          }
        })

        const allContent = (await Promise.all(contentPromises)).flat()
        setContentItems(allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      } catch (error: any) {
        console.error("Error fetching subscriber content:", error)
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role.includes("SUBSCRIBER")) {
      fetchSubscriberContent()
    }
  }, [user])


  const handleViewContent = (content: ContentItem) => {
    setSelectedContent(content)
  }

  const handleAccessContent = (content: ContentItem) => {
    // Only support external redirects
    if (content.contentUrl) {
      // Open external URL in new tab
      window.open(content.contentUrl, '_blank', 'noopener,noreferrer')
      toast({
        title: "Opening Content",
        description: `Redirecting to ${content.title}...`,
      })
    } else {
      toast({
        title: "Content Not Available",
        description: "This content link is not yet configured. Please contact the creator.",
        variant: "destructive",
      })
    }
  }

  const getContentIcon = (type: string) => {
    const Icon = CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default
    return <Icon className="w-5 h-5 text-[lab(65_43.46_12.07)]" />
  }

  const getTierBadge = (tier?: string) => {
    if (!tier) return null
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${TIER_COLORS[tier as keyof typeof TIER_COLORS] || "bg-slate-500/20 text-slate-400"}`}>
        {tier} Only
      </span>
    )
  }

  const isNewContent = (createdAt: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(createdAt) > sevenDaysAgo
  }

  const newContentItems = contentItems.filter((item) => isNewContent(item.createdAt))
  
  // Apply filters
  let displayedContent = showNewOnly ? newContentItems : contentItems
  
  if (filterCreator !== "all") {
    displayedContent = displayedContent.filter((item) => {
      if (!item.creator?._id) return false
      const creatorId = typeof item.creator._id === "string" 
        ? item.creator._id 
        : String(item.creator._id)
      return creatorId === filterCreator
    })
  }
  
  if (filterType !== "all") {
    displayedContent = displayedContent.filter((item) => item.type === filterType)
  }

  const uniqueCreators = Array.from(
    new Map(
      contentItems
        .map((item) => item.creator)
        .filter(Boolean)
        .map((creator) => {
          if (!creator?._id) return ["", creator]
          const creatorId = typeof creator._id === "string" 
            ? creator._id 
            : String(creator._id)
          return [creatorId, creator]
        })
    ).values()
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
      <SubscriberNavbar />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex gap-8">
        {/* Subscriptions Sidebar */}
        {subscriptions.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Subscriptions
              </h2>
              <div className="space-y-2">
                {subscriptions.map((sub) => {
                  // Prefer creator._id as it's guaranteed to be correct, fallback to creatorId
                  let creatorId: string = ""
                  
                  if (sub.creator?._id) {
                    // Use creator._id first (most reliable)
                    creatorId = typeof sub.creator._id === "string" 
                      ? sub.creator._id 
                      : String(sub.creator._id)
                  } else if (typeof sub.creatorId === "string" && sub.creatorId) {
                    // Fallback to creatorId from subscription
                    creatorId = sub.creatorId
                  } else if (sub.creatorId) {
                    // Last resort - stringify whatever we have
                    creatorId = String(sub.creatorId)
                  }

                  // Skip if no valid creatorId
                  if (!creatorId || creatorId === "undefined" || creatorId === "null" || creatorId === "") {
                    console.warn("Invalid creatorId for subscription:", sub)
                    return null
                  }

                  console.log(`Creating link for creator: ${sub.creator?.displayName}, ID: ${creatorId}`)

                  return (
                    <Link
                      key={sub._id}
                      href={`/subscriber/creator/${creatorId}`}
                      className="block p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <p className="text-white font-medium text-sm">{sub.creator?.displayName || "Unknown"}</p>
                      <p className="text-xs text-slate-400 mt-1">{sub.tier}</p>
                    </Link>
                  )
                }).filter(Boolean)}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-slate-600 text-slate-300"
                onClick={() => router.push("/subscriber/discover")}
              >
                <Search className="w-4 h-4 mr-2" />
                Discover More
              </Button>
            </Card>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Premium Content Library</h1>
                <p className="text-slate-400">
                  Access exclusive content from your subscribed creators.
                </p>
              </div>
              {newContentItems.length > 0 && (
                <Button
                  variant={showNewOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowNewOnly(!showNewOnly)}
                  className={showNewOnly ? "bg-blue-500" : "border-slate-600"}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  New ({newContentItems.length})
                </Button>
              )}
            </div>
            {newContentItems.length > 0 && !showNewOnly && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    <strong>{newContentItems.length}</strong> new content items from the last 7 days!
                  </span>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Filters:</span>
              </div>
              <Select value={filterCreator} onValueChange={setFilterCreator}>
                <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="All Creators" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Creators</SelectItem>
                  {uniqueCreators.map((creator) => {
                    const creatorId = creator?._id 
                      ? (typeof creator._id === "string" ? creator._id : String(creator._id))
                      : ""
                    return (
                      <SelectItem key={creatorId} value={creatorId || ""}>
                        {creator?.displayName || "Unknown"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px] bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="live_session">Live Sessions</SelectItem>
                </SelectContent>
              </Select>
              {(filterCreator !== "all" || filterType !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCreator("all")
                    setFilterType("all")
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading content...</p>
            </div>
          ) : displayedContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedContent.map((item) => {
                const thumbnailUrl = getThumbnailWithFallback(
                  item.title,
                  item.type,
                  item.creator?.niche
                )
                
                return (
                <Card
                  key={item._id}
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => !(item as any).isLocked && handleViewContent(item)}
                >
                  {/* Thumbnail Image - YouTube Style */}
                  <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/400x225/4A5568/FFFFFF?text=${encodeURIComponent(item.title.substring(0, 20))}`
                      }}
                    />
                    {/* Overlay with play icon and duration */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      {item.type === "video" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-red-500/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Badges on thumbnail */}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {isNewContent(item.createdAt) && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold">
                          NEW
                        </span>
                      )}
                      {item.isPremium && (
                        <span className="px-2 py-0.5 bg-yellow-500/90 text-white text-xs rounded font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3" fill="white" />
                          Premium
                        </span>
                      )}
                    </div>
                    {/* Type badge bottom right */}
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded capitalize backdrop-blur-sm">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-xs z-50">
                          <p className="whitespace-normal break-words">{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <p className="text-xs text-slate-400 mb-1">
                        {item.creator?.displayName || "Unknown Creator"}
                      </p>
                      
                      {item.description && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.isPremium && getTierBadge(item.requiredTier)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {(item as any).isLocked ? (
                      <div className="mt-3">
                        <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                          <Lock className="w-3 h-3 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-yellow-400">Requires {(item as any).requiredTier}</p>
                        </div>
                        <Button
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/subscriber/creator/${item.creatorId}`)
                          }}
                        >
                          Upgrade to Access
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white text-xs py-2 mt-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewContent(item)
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View Content
                      </Button>
                    )}
                  </div>
                </Card>
                )
              })}
          </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              {subscriptions.length === 0 ? (
                <>
                  <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Subscriptions Yet</h3>
                  <p className="text-slate-400 mb-4">
                    Discover and subscribe to creators to see their exclusive content here.
                  </p>
                  <Button
                    className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white"
                    onClick={() => router.push("/subscriber/discover")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Discover Creators
                  </Button>
                </>
              ) : (
                <>
                  <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {showNewOnly ? "No New Content" : "No Content Available"}
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {showNewOnly
                      ? "No new content from the last 7 days. Check back soon!"
                      : "No content is available for your tier yet. Check back soon for exclusive content!"}
                  </p>
                  {showNewOnly && (
                    <Button
                      variant="outline"
                      onClick={() => setShowNewOnly(false)}
                      className="border-slate-600"
                    >
                      Show All Content
                    </Button>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContent(null)}
        >
          <Card
            className="bg-slate-800 border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getContentIcon(selectedContent.type)}
                  <h2 className="text-2xl font-bold text-white">{selectedContent.title}</h2>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-slate-400 text-sm">by {selectedContent.creator?.displayName || "Unknown Creator"}</p>
                  {selectedContent.creator?.niche && (
                    <span className="text-xs text-slate-500">• {selectedContent.creator.niche}</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedContent(null)}
                className="text-slate-400 hover:text-white"
                title="Close"
              >
                ×
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded capitalize">
                {selectedContent.type}
              </span>
              {selectedContent.isPremium && (
                <>
                  <Star className="w-3 h-3 text-yellow-400" />
                  {getTierBadge(selectedContent.requiredTier)}
                </>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                <Calendar className="w-3 h-3" />
                {new Date(selectedContent.createdAt).toLocaleDateString()}
              </div>
            </div>

            {selectedContent.description && (
              <div className="mb-3">
                <p className="text-slate-300 text-sm leading-relaxed">{selectedContent.description}</p>
              </div>
            )}

            {selectedContent.contentUrl ? (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <p className="text-xs text-blue-400 font-medium">External Content</p>
                </div>
                <p className="text-xs text-slate-400 break-all mb-1">{selectedContent.contentUrl}</p>
                <p className="text-xs text-slate-500">Clicking the button below will open this link in a new tab.</p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <p className="text-xs text-yellow-400">Content link not configured</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">This content does not have an external link yet.</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white"
                onClick={() => handleAccessContent(selectedContent)}
                disabled={!selectedContent.contentUrl}
              >
                {selectedContent.type === "video" && (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </>
                )}
                {selectedContent.type === "course" && (
                  <>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Access Course
                  </>
                )}
                {selectedContent.type === "post" && (
                  <>
                    <Newspaper className="w-4 h-4 mr-2" />
                    Read Post
                  </>
                )}
                {selectedContent.type === "live_session" && (
                  <>
                    <Radio className="w-4 h-4 mr-2" />
                    Join Session
                  </>
                )}
                {!["video", "course", "post", "live_session"].includes(selectedContent.type) && (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access Content
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white"
                onClick={() => setSelectedContent(null)}
              >
                Back
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
