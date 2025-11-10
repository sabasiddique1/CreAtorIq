"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Upload, Copy, MessageSquare, Calendar } from "lucide-react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { graphqlQuery } from "../../../lib/graphql"

interface CommentBatch {
  _id: string
  source: string
  rawComments: Array<{
    author: string
    text: string
    timestamp?: string
  }>
  importedAt: string
}

export default function AudiencePage() {
  const { user } = useAuthStore()
  const [importMode, setImportMode] = useState<"paste" | "csv" | null>(null)
  const [pastedComments, setPastedComments] = useState("")
  const [importing, setImporting] = useState(false)
  const [batches, setBatches] = useState<CommentBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)

  const fetchBatches = async () => {
    if (!user) return

    setLoading(true)
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
        // Fetch comment batches directly
        const batchesResult = await graphqlQuery(
          `
          query {
            commentBatches(creatorId: "${profileResult.myCreatorProfile._id}") {
              _id
              source
              rawComments
              importedAt
            }
          }
        `
        )

        if (batchesResult?.commentBatches) {
          setBatches(batchesResult.commentBatches)
        } else {
          setBatches([])
        }
      } else {
        setBatches([])
      }
    } catch (error) {
      console.error("Error fetching batches:", error)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBatches()
    }
  }, [user])

  const handleImport = async (e?: React.MouseEvent) => {
    console.log("=== handleImport FUNCTION CALLED ===")
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log("handleImport called", { 
      pastedComments: pastedComments.substring(0, 50), 
      pastedCommentsTrimmed: pastedComments.trim().length,
      user: !!user 
    })
    
    if (!pastedComments.trim()) {
      alert("Please paste some comments first")
      return
    }
    
    if (!user) {
      alert("Please log in first")
      return
    }

    setImporting(true)
    try {
      // Parse comments (one per line or JSON array)
      let comments: any[] = []
      try {
        const parsed = JSON.parse(pastedComments)
        comments = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        // If not JSON, treat as one comment per line
        comments = pastedComments
          .split("\n")
          .filter((line) => line.trim())
          .map((text) => ({
            text: text.trim(),
            author: "Anonymous",
            timestamp: new Date().toISOString(),
          }))
      }

      if (comments.length === 0) {
        alert("No valid comments found. Please paste some comments.")
        return
      }

      // Get creator profile first
      const profileResult = await graphqlQuery(`
        query {
          myCreatorProfile {
            _id
          }
        }
      `)

      if (!profileResult?.myCreatorProfile) {
        alert("Creator profile not found. Please complete onboarding first.")
        return
      }

      console.log("Calling importCommentBatch mutation", {
        creatorId: profileResult.myCreatorProfile._id,
        source: "MANUAL_PASTE",
        commentsCount: comments.length,
      })

      // Import the comment batch
      const importResult = await graphqlQuery(
        `
        mutation ImportCommentBatch(
          $creatorId: ID!
          $source: String!
          $rawComments: [JSON!]!
        ) {
          importCommentBatch(
            creatorId: $creatorId
            source: $source
            rawComments: $rawComments
          ) {
            _id
            importedAt
          }
        }
      `,
        {
          creatorId: profileResult.myCreatorProfile._id,
          source: "MANUAL_PASTE",
          rawComments: comments,
        }
      )

      console.log("Import result:", importResult)

      if (importResult?.importCommentBatch) {
        // Refresh batches list
        await fetchBatches()
        setPastedComments("")
        setImportMode(null)
        alert(`Successfully imported ${comments.length} comments!`)
      }
    } catch (error: any) {
      console.error("Error importing comments:", error)
      alert(`Error importing comments: ${error.message || "Unknown error"}`)
    } finally {
      setImporting(false)
    }
  }

  const handleAnalyze = async (batchId: string) => {
    if (!user) return

    setAnalyzing(batchId)
    try {
      const result = await graphqlQuery(
        `
        mutation {
          analyzeCommentBatch(batchId: "${batchId}") {
            _id
            overallSentimentScore
            positiveCount
            negativeCount
            topKeywords
          }
        }
      `
      )

      if (result?.analyzeCommentBatch) {
        alert("Comments analyzed successfully! You can now generate ideas on the Ideas page.")
        // Optionally refresh batches to show analysis status
        await fetchBatches()
      }
    } catch (error: any) {
      console.error("Error analyzing comments:", error)
      alert(`Error analyzing comments: ${error.message || "Unknown error"}`)
    } finally {
      setAnalyzing(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audience & Sentiment</h1>
        <p className="text-slate-400">Analyze comments to understand your audience better.</p>
      </div>

      {/* Import Section */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Import Comments</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setImportMode(importMode === "paste" ? null : "paste")}
            className="flex items-center gap-3 p-4 border-2 border-slate-600 rounded-lg hover:border-blue-400 transition text-left"
          >
            <Copy className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-medium text-white">Paste Text</p>
              <p className="text-sm text-slate-400">Paste comments directly</p>
            </div>
          </button>

          <button
            onClick={() => setImportMode(importMode === "csv" ? null : "csv")}
            className="flex items-center gap-3 p-4 border-2 border-slate-600 rounded-lg hover:border-purple-400 transition text-left"
          >
            <Upload className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium text-white">Upload CSV</p>
              <p className="text-sm text-slate-400">Import from file</p>
            </div>
          </button>
        </div>

        {importMode === "paste" && (
          <div className="space-y-4">
            <div>
              <textarea
                value={pastedComments}
                onChange={(e) => {
                  console.log("Textarea changed, length:", e.target.value.length)
                  setPastedComments(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault()
                    console.log("Ctrl+Enter pressed, triggering import")
                    const button = e.currentTarget.closest('div')?.querySelector('button[type="button"]') as HTMLButtonElement
                    if (button && !button.disabled) {
                      button.click()
                    }
                  }
                }}
                placeholder="Paste comments here, one per line or as JSON array... (Ctrl+Enter to import)"
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded text-white p-3 focus:border-blue-400 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Characters: {pastedComments.length} | Trimmed: {pastedComments.trim().length} | 
                Button disabled: {importing || !pastedComments.trim() ? "Yes" : "No"} | 
                User: {user ? "Logged in" : "Not logged in"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  console.log("=== BUTTON CLICKED ===")
                  e.preventDefault()
                  e.stopPropagation()
                  
                  const trimmed = pastedComments.trim()
                  console.log("Button clicked", { 
                    pastedComments: pastedComments.substring(0, 50), 
                    pastedCommentsLength: pastedComments.length,
                    pastedCommentsTrimmed: trimmed.length,
                    importing, 
                    user: !!user,
                    isDisabled: importing || !trimmed
                  })
                  
                  if (importing) {
                    console.log("Already importing, ignoring click")
                    return
                  }
                  
                  if (!trimmed) {
                    console.log("No comments pasted, showing alert")
                    alert("Please paste some comments first")
                    return
                  }
                  
                  console.log("Calling handleImport...")
                  handleImport(e).catch((err) => {
                    console.error("Error in handleImport:", err)
                    alert(`Error: ${err.message || "Unknown error"}`)
                  })
                }}
                disabled={importing || !pastedComments.trim()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title={!pastedComments.trim() ? "Please paste some comments first" : importing ? "Importing..." : "Click to import comments"}
              >
                {importing ? "Importing..." : "Import Comments"}
              </button>
              <Button
                onClick={() => {
                  setPastedComments("")
                  setImportMode(null)
                }}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Batches */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Imports</h2>
        {loading ? (
          <p className="text-slate-400">Loading batches...</p>
        ) : batches.length > 0 ? (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch._id} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">
                      {batch.rawComments.length} comments
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{batch.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(batch.importedAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    onClick={() => handleAnalyze(batch._id)}
                    disabled={analyzing === batch._id}
                    className="bg-purple-600 hover:bg-purple-700 text-sm"
                    size="sm"
                  >
                    {analyzing === batch._id ? "Analyzing..." : "Analyze for Ideas"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No comment batches yet. Import your first batch above.</p>
        )}
      </Card>
    </div>
  )
}
