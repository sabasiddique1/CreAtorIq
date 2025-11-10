"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { graphqlQuery } from "../../../lib/graphql"
import { Lock, Star, LogOut, Video, BookOpen, FileText, Calendar, ExternalLink, Play, GraduationCap, Newspaper, Radio } from "lucide-react"
import { toast } from "../../../hooks/use-toast"

interface ContentItem {
  _id: string
  title: string
  type: string
  status: string
  isPremium: boolean
  requiredTier?: string
  description?: string
  contentUrl?: string
  contentBody?: string
  createdAt: string
  creator?: {
    displayName: string
    niche: string
  }
}

interface SubscriberProfile {
  _id: string
  creatorId: string
  tier: string
  creator: {
    _id: string
    displayName: string
    niche: string
  }
}

export default function SubscriberDashboard() {
  const router = useRouter()
  const { user, checkAuth, logout } = useAuthStore()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)

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
        // Get subscriber tier (T1, T2, or T3)
        const userTier = user.role.replace("SUBSCRIBER_", "")

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

        if (!subscriptionsResult?.mySubscriptions || subscriptionsResult.mySubscriptions.length === 0) {
          setContentItems([])
          setLoading(false)
          return
        }

        // For each subscribed creator, get their published content
        const contentPromises = subscriptionsResult.mySubscriptions.map(async (subscription: SubscriberProfile) => {
          try {
            // Ensure creatorId is a string (not an object)
            const creatorId = typeof subscription.creatorId === "object" 
              ? (subscription.creator?._id || subscription.creatorId?._id || subscription.creatorId)
              : subscription.creatorId
            
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
              const tierHierarchy: { [key: string]: string[] } = {
                T1: ["T1"],
                T2: ["T1", "T2"],
                T3: ["T1", "T2", "T3"],
              }

              const accessibleTiers = tierHierarchy[userTier] || []

              return contentResult.contentItems
                .filter((item: ContentItem) => {
                  // Free content is accessible to all
                  if (!item.isPremium) return true
                  // Premium content must match tier requirement
                  if (!item.requiredTier) return true
                  return accessibleTiers.includes(item.requiredTier)
                })
                .map((item: ContentItem) => ({
                  ...item,
                  creator: subscription.creator || undefined,
                }))
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

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

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
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />
      case "course":
        return <BookOpen className="w-5 h-5" />
      case "post":
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getTierBadge = (tier?: string) => {
    if (!tier) return null
    const colors: { [key: string]: string } = {
      T1: "bg-blue-500/20 text-blue-400",
      T2: "bg-purple-500/20 text-purple-400",
      T3: "bg-yellow-500/20 text-yellow-400",
    }
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${colors[tier] || "bg-slate-500/20 text-slate-400"}`}>
        {tier} Only
      </span>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  const userTier = user.role.replace("SUBSCRIBER_", "")

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="text-xl font-bold text-blue-400">Engagement Nexus</div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-slate-400">Subscriber Tier</p>
              <p className="text-white font-semibold">{userTier}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Premium Content Library</h1>
          <p className="text-slate-400">
            Access exclusive content created just for {userTier} tier members.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading content...</p>
          </div>
        ) : contentItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentItems.map((item) => (
              <Card
                key={item._id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getContentIcon(item.type)}
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      by {item.creator?.displayName || "Unknown Creator"}
                    </p>
                    {item.creator?.niche && (
                      <p className="text-xs text-slate-500 mb-2">{item.creator.niche}</p>
                    )}
                  </div>
                  {item.isPremium && <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                </div>

                {item.description && (
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded capitalize">
                      {item.type}
                    </span>
                    {item.isPremium && getTierBadge(item.requiredTier)}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewContent(item)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Content
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Content Available</h3>
            <p className="text-slate-400">
              No content is available for your tier yet. Check back soon for exclusive content!
            </p>
          </Card>
        )}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
    </main>
  )
}
