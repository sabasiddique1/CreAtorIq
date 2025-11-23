"use client"

import { useEffect, useState } from "react"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { graphqlQuery } from "../../../lib/graphql"
import { toast } from "../../../hooks/use-toast"
import { Search, Trash2, CheckCircle, XCircle, FileText, Calendar, Star } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"

interface ContentItem {
  _id: string
  title: string
  type: string
  status: string
  isPremium: boolean
  createdAt: string
  creator?: {
    displayName: string
  }
}

export default function ContentModerationPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    let filtered = content

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    setFilteredContent(filtered)
  }, [content, searchTerm, statusFilter])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const result = await graphqlQuery(`
        query {
          allContentItems {
            _id
            title
            type
            status
            isPremium
            createdAt
            creator {
              displayName
            }
          }
        }
      `)

      if (result?.allContentItems) {
        setContent(result.allContentItems)
      }
    } catch (error: any) {
      console.error("Error fetching content:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (contentId: string, status: string) => {
    try {
      await graphqlQuery(
        `
        mutation UpdateContentItemStatus($id: ID!, $status: String!) {
          updateContentItemStatus(id: $id, status: $status) {
            _id
            status
          }
        }
      `,
        { id: contentId, status }
      )

      toast({
        title: "Success",
        description: `Content ${status === "published" ? "published" : "unpublished"} successfully`,
      })
      await fetchContent()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update content status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (contentId: string) => {
    setContentToDelete(contentId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!contentToDelete) return

    try {
      await graphqlQuery(
        `
        mutation DeleteContentItem($id: ID!) {
          deleteContentItem(id: $id)
        }
      `,
        { id: contentToDelete }
      )

      toast({
        title: "Success",
        description: "Content deleted successfully",
      })
      setDeleteDialogOpen(false)
      setContentToDelete(null)
      await fetchContent()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-400">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
        <p className="text-slate-400">Review, approve, and manage platform content</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by title, type, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Content List */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Content Items ({filteredContent.length})
          </h2>
        </div>

        <div className="space-y-3">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <div
                key={item._id}
                className="border border-slate-700 rounded-lg p-4 bg-slate-900/50 hover:bg-slate-900 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        {item.type}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${
                                item.status === "published"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }`}
                            >
                              {item.status === "published" && <Star className="w-3 h-3 fill-current" />}
                              {item.status}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.status === "published" ? "Published" : item.status}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {item.isPremium && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-2">
                      {item.creator?.displayName
                        ? `By ${item.creator.displayName}`
                        : "Unknown Creator"}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {item.status !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item._id, "published")}
                        className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {item.status === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item._id, "draft")}
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Unpublish
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(item._id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No content found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

