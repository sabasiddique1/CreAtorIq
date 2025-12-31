"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Plus, FileText, Star, Lock } from "lucide-react"
import { Input } from "../../../components/ui/input"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { toast } from "../../../hooks/use-toast"
import { graphqlQuery, GET_CONTENT_ITEMS, CREATE_CONTENT_ITEM } from "../../../lib/graphql"

interface ContentItem {
  _id: string
  title: string
  type: string
  status: string
  isPremium: boolean
  requiredTier?: string
  description?: string
  createdAt: string
}

export default function ContentPage() {
  const { user } = useAuthStore()
  const [showNewForm, setShowNewForm] = useState(false)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newContent, setNewContent] = useState({
    title: "",
    type: "video",
    isPremium: false,
    description: "",
  })

  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return

      try {
        // Get creator profile first
        const profileResult = await graphqlQuery(`
          query {
            myCreatorProfile {
              _id
            }
          }
        `)

        if (profileResult?.myCreatorProfile) {
          const result = await graphqlQuery(GET_CONTENT_ITEMS, {
            creatorId: profileResult.myCreatorProfile._id,
            filter: {},
          })
          if (result?.contentItems) {
            setContentItems(result.contentItems)
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [user])

  const handleCreateContent = async () => {
    if (!newContent.title || !user) return

    try {
      // Get creator profile first
      const profileResult = await graphqlQuery(`
        query {
          myCreatorProfile {
            _id
          }
        }
      `)

      if (profileResult?.myCreatorProfile) {
        await graphqlQuery(CREATE_CONTENT_ITEM, {
          creatorId: profileResult.myCreatorProfile._id,
          title: newContent.title,
          type: newContent.type,
          isPremium: newContent.isPremium,
          description: newContent.description,
        })

        toast({
          title: "Content Created",
          description: `"${newContent.title}" has been created successfully!`,
        })

        // Refresh content list
        const result = await graphqlQuery(GET_CONTENT_ITEMS, {
          creatorId: profileResult.myCreatorProfile._id,
          filter: {},
        })
        if (result?.contentItems) {
          setContentItems(result.contentItems)
        }

        setNewContent({ title: "", type: "video", isPremium: false, description: "" })
        setShowNewForm(false)
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create content. Please try again."
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      console.error("Error creating content:", error)
    }
  }

  return (
    <div className="space-y-8 px-6 py-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Manage and organize your premium content.</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2">
          <Plus className="w-4 h-4" /> New Content
        </Button>
      </div>

      {/* New Content Form */}
      {showNewForm && (
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Create New Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <Input
                value={newContent.title}
                onChange={(e) => setNewContent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Content title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select
                value={newContent.type}
                onChange={(e) => setNewContent((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="video">Video</option>
                <option value="course">Course</option>
                <option value="post">Post</option>
                <option value="live_session">Live Session</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={newContent.description}
                onChange={(e) => setNewContent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Content description"
                rows={3}
                className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newContent.isPremium}
                onChange={(e) => setNewContent((prev) => ({ ...prev, isPremium: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-foreground">Premium Content</label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateContent}
                disabled={!newContent.title}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                Create Content
              </Button>
              <Button
                onClick={() => setShowNewForm(false)}
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Content List */}
      {loading ? (
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6">
          <p className="text-muted-foreground">Loading content...</p>
        </Card>
      ) : contentItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <Card key={item._id} className="bg-background/80 backdrop-blur-sm border-border/30 p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                </div>
                {item.isPremium && (
                  <Star className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              {item.description && (
                <p className="text-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    item.status === "published"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-border/30"
                  }`}
                >
                  {item.status}
                </span>
                {item.isPremium && item.requiredTier && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Tier {item.requiredTier}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <FileText className="w-5 h-5" />
            <p>No content items yet. Create your first item above.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
