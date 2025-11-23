"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Plus, FileText, Star, Lock } from "lucide-react"
import { Input } from "../../../components/ui/input"
import { useAuthStore } from "../../../hooks/use-auth-store"
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
    } catch (error) {
      console.error("Error creating content:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
          <p className="text-slate-400">Manage and organize your premium content.</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white gap-2">
          <Plus className="w-4 h-4" /> New Content
        </Button>
      </div>

      {/* New Content Form */}
      {showNewForm && (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <Input
                value={newContent.title}
                onChange={(e) => setNewContent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Content title"
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={newContent.type}
                onChange={(e) => setNewContent((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded p-2"
              >
                <option value="video">Video</option>
                <option value="course">Course</option>
                <option value="post">Post</option>
                <option value="live_session">Live Session</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={newContent.description}
                onChange={(e) => setNewContent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Content description"
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded p-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newContent.isPremium}
                onChange={(e) => setNewContent((prev) => ({ ...prev, isPremium: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-slate-300">Premium Content</label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateContent}
                disabled={!newContent.title}
                className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white"
              >
                Create Content
              </Button>
              <Button
                onClick={() => setShowNewForm(false)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Content List */}
      {loading ? (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <p className="text-slate-300">Loading content...</p>
        </Card>
      ) : contentItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <Card key={item._id} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 capitalize">{item.type}</p>
                </div>
                {item.isPremium && (
                  <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              {item.description && (
                <p className="text-slate-300 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    item.status === "published"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {item.status}
                </span>
                {item.isPremium && item.requiredTier && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Tier {item.requiredTier}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 text-slate-300">
            <FileText className="w-5 h-5" />
            <p>No content items yet. Create your first item above.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
