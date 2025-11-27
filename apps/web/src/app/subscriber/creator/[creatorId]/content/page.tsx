"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/hooks/use-auth-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { graphqlQuery } from "@/lib/graphql"
import { ArrowLeft, Lock, Star, Sparkles, Play, GraduationCap, Newspaper, Radio, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SubscriberNavbar } from "@/components/subscriber/navbar"
import type { ContentItem } from "@/types"
import { CONTENT_TYPE_ICONS, TIER_COLORS } from "@/constants"

interface ContentItemWithView extends ContentItem {
  isViewed: boolean
  isNew: boolean
}

export default function CreatorContentPage() {
  const router = useRouter()
  const params = useParams()
  const creatorId = params.creatorId as string
  const { user, checkAuth, logout } = useAuthStore()
  const [contentItems, setContentItems] = useState<ContentItemWithView[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedContent, setSelectedContent] = useState<ContentItemWithView | null>(null)

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
      fetchContent()
    }
  }, [creatorId, user, activeTab])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const filter: any = { status: "published" }
      if (activeTab !== "all") {
        filter.type = activeTab
      }

      const result = await graphqlQuery(
        `
        query ContentItemsWithView($creatorId: ID!, $filter: ContentFilterInput) {
          contentItemsWithView(creatorId: $creatorId, filter: $filter) {
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
            isViewed
            isNew
          }
        }
      `,
        {
          creatorId,
          filter,
        }
      )

      if (result?.contentItemsWithView) {
        setContentItems(result.contentItemsWithView)
      }
    } catch (error: any) {
      console.error("Error fetching content:", error)
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsViewed = async (contentId: string) => {
    try {
      await graphqlQuery(
        `
        mutation MarkContentAsViewed($contentItemId: ID!) {
          markContentAsViewed(contentItemId: $contentItemId)
        }
      `,
        { contentItemId: contentId }
      )

      // Update local state
      setContentItems((items) =>
        items.map((item) =>
          item._id === contentId ? { ...item, isViewed: true, isNew: false } : item
        )
      )

      if (selectedContent && selectedContent._id === contentId) {
        setSelectedContent({ ...selectedContent, isViewed: true, isNew: false })
      }
    } catch (error: any) {
      console.error("Error marking as viewed:", error)
    }
  }

  const handleAccessContent = async (content: ContentItemWithView) => {
    if (content.contentUrl) {
      // Mark as viewed when accessing
      if (!content.isViewed) {
        await handleMarkAsViewed(content._id)
      }
      window.open(content.contentUrl, "_blank", "noopener,noreferrer")
      toast({
        title: "Opening Content",
        description: `Redirecting to ${content.title}...`,
      })
    } else {
      toast({
        title: "Content Not Available",
        description: "This content link is not yet configured.",
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
      <span
        className={`px-2 py-0.5 text-xs rounded ${
          TIER_COLORS[tier as keyof typeof TIER_COLORS] || "bg-slate-500/20 text-slate-400"
        }`}
      >
        {tier} Only
      </span>
    )
  }

  const filteredContent = contentItems.filter((item) => {
    if (activeTab === "all") return true
    return item.type === activeTab
  })

  const unreadCounts = {
    all: contentItems.filter((item) => !item.isViewed).length,
    video: contentItems.filter((item) => item.type === "video" && !item.isViewed).length,
    course: contentItems.filter((item) => item.type === "course" && !item.isViewed).length,
    post: contentItems.filter((item) => item.type === "post" && !item.isViewed).length,
    live_session: contentItems.filter((item) => item.type === "live_session" && !item.isViewed).length,
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

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col overflow-hidden">
      <SubscriberNavbar />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/subscriber/creator/${creatorId}`)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Content Library</h1>
          <p className="text-slate-400">Browse all content from this creator</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500">
              All {unreadCounts.all > 0 && `(${unreadCounts.all})`}
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-blue-500">
              Videos {unreadCounts.video > 0 && `(${unreadCounts.video})`}
            </TabsTrigger>
            <TabsTrigger value="course" className="data-[state=active]:bg-blue-500">
              Courses {unreadCounts.course > 0 && `(${unreadCounts.course})`}
            </TabsTrigger>
            <TabsTrigger value="post" className="data-[state=active]:bg-blue-500">
              Posts {unreadCounts.post > 0 && `(${unreadCounts.post})`}
            </TabsTrigger>
            <TabsTrigger value="live_session" className="data-[state=active]:bg-blue-500">
              Live {unreadCounts.live_session > 0 && `(${unreadCounts.live_session})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Grid */}
        {filteredContent.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card
                key={item._id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-blue-500 transition flex flex-col h-full"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                        {getContentIcon(item.type)}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.isNew && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0">
                              NEW
                            </span>
                          )}
                          {!item.isViewed && !item.isNew && (
                            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full flex-shrink-0">
                              UNREAD
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-white truncate flex-1 min-w-0">
                            {item.title}
                          </h3>
                        </div>
                      </div>
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
                  </div>
                </div>

                <Button
                  className="w-full bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 text-white mt-auto"
                  onClick={() => handleAccessContent(item)}
                  disabled={!item.contentUrl}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {item.isViewed ? "View Again" : "View Content"}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No content available in this category.</p>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}

