"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Upload, Copy, MessageSquare, Calendar, X } from "lucide-react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { graphqlQuery } from "../../../lib/graphql"
import { useToast } from "../../../hooks/use-toast"
import { IDEA_TYPE_ICONS, IDEA_TYPE_LABELS } from "../../../constants"

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

interface IdeaSuggestion {
  _id: string
  title: string
  description: string
  ideaType: string
  tierTarget: string
  outline: string[]
  status: string
}

export default function AudiencePage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMode, setImportMode] = useState<"paste" | "csv" | null>(null)
  const [pastedComments, setPastedComments] = useState("")
  const [parsedComments, setParsedComments] = useState<Array<{ text: string; author: string }>>([])
  const [importing, setImporting] = useState(false)
  const [batches, setBatches] = useState<CommentBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaSuggestion[]>([])
  const [showIdeasModal, setShowIdeasModal] = useState(false)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)

  const fetchBatches = async () => {
    if (!user) return

    setLoading(true)
    try {
      const profileResult = await graphqlQuery(`
        query {
          myCreatorProfile {
            _id
          }
        }
      `)

      if (profileResult?.myCreatorProfile) {
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

  // Parse comments when pastedComments changes
  useEffect(() => {
    if (pastedComments.trim()) {
      try {
        const parsed = JSON.parse(pastedComments)
        const comments = Array.isArray(parsed) ? parsed : [parsed]
        setParsedComments(comments.map((c: any) => ({
          text: c.text || c,
          author: c.author || "Anonymous"
        })))
      } catch {
        const comments = pastedComments
          .split("\n")
          .filter((line) => line.trim())
          .map((text) => ({
            text: text.trim(),
            author: "Anonymous"
          }))
        setParsedComments(comments)
      }
    } else {
      setParsedComments([])
    }
  }, [pastedComments])

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // Parse CSV (simple parser - assumes first column is comment text)
      const comments = lines.map((line, index) => {
        // Skip header row if present
        if (index === 0 && (line.toLowerCase().includes('comment') || line.toLowerCase().includes('text'))) {
          return null
        }
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))
        return {
          text: parts[0] || line.trim(),
          author: parts[1] || "Anonymous",
          timestamp: parts[2] ? new Date(parts[2]).toISOString() : new Date().toISOString(),
        }
      }).filter(Boolean) as Array<{ text: string; author: string; timestamp: string }>

      if (comments.length === 0) {
        toast({
          title: "No comments found",
          description: "CSV file appears to be empty or invalid",
          variant: "destructive",
        })
        return
      }

      const profileResult = await graphqlQuery(`
        query {
          myCreatorProfile {
            _id
          }
        }
      `)

      if (!profileResult?.myCreatorProfile) {
        toast({
          title: "Profile not found",
          description: "Please complete onboarding first.",
          variant: "destructive",
        })
        return
      }

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
          source: "CSV_UPLOAD",
          rawComments: comments,
        }
      )

      if (importResult?.importCommentBatch) {
        await fetchBatches()
        setImportMode(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast({
          title: "Success",
          description: `Successfully imported ${comments.length} comments from CSV!`,
        })
      }
    } catch (error: any) {
      console.error("Error importing CSV:", error)
      toast({
        title: "Import failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleImport = async () => {
    if (!pastedComments.trim()) {
      toast({
        title: "No comments",
        description: "Please paste some comments first",
        variant: "destructive",
      })
      return
    }
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in first",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    try {
      let comments: any[] = []
      try {
        const parsed = JSON.parse(pastedComments)
        comments = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
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
        toast({
          title: "Invalid comments",
          description: "No valid comments found. Please paste some comments.",
          variant: "destructive",
        })
        return
      }

      const profileResult = await graphqlQuery(`
        query {
          myCreatorProfile {
            _id
          }
        }
      `)

      if (!profileResult?.myCreatorProfile) {
        toast({
          title: "Profile not found",
          description: "Please complete onboarding first.",
          variant: "destructive",
        })
        return
      }

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

      if (importResult?.importCommentBatch) {
        toast({
          title: "Comments Imported",
          description: `Successfully imported ${comments.length} comment${comments.length !== 1 ? 's' : ''}!`,
        })
        await fetchBatches()
        setPastedComments("")
        setParsedComments([])
        setImportMode(null)
        toast({
          title: "Success",
          description: `Successfully imported ${comments.length} comments!`,
        })
      }
    } catch (error: any) {
      console.error("Error importing comments:", error)
      toast({
        title: "Import failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
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
        const snapshotId = result.analyzeCommentBatch._id
        toast({
          title: "Analysis Complete",
          description: "Comments analyzed successfully! Generating ideas...",
        })
        
        await handleGenerateIdeas(snapshotId)
        await fetchBatches() // Refresh batches to show updated status
      } else {
        toast({
          title: "Analysis Failed",
          description: "No results returned from analysis",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error analyzing comments:", error)
      const errorMessage = error?.message || "Failed to analyze comments. Please try again."
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setAnalyzing(null)
    }
  }

  const handleGenerateIdeas = async (snapshotId: string) => {
    if (!user) return

    setGeneratingIdeas(true)
    try {
      const result = await graphqlQuery(
        `
        mutation {
          generateIdeas(snapshotId: "${snapshotId}", tierTarget: null) {
            _id
            title
            description
            ideaType
            tierTarget
            outline
            status
          }
        }
      `
      )

      if (result?.generateIdeas && result.generateIdeas.length > 0) {
        setGeneratedIdeas(result.generateIdeas)
        setShowIdeasModal(true)
        toast({
          title: "Ideas generated",
          description: `Successfully generated ${result.generateIdeas.length} content ideas!`,
        })
      } else {
        toast({
          title: "No ideas generated",
          description: "This might be due to missing API key or insufficient data.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error)
      toast({
        title: "Generation failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setGeneratingIdeas(false)
    }
  }

  const getIdeaTypeIcon = (type: string) => {
    const Icon = IDEA_TYPE_ICONS[type] || IDEA_TYPE_ICONS.default
    return <Icon className="w-4 h-4" />
  }

  const getIdeaTypeLabel = (type: string) => {
    return IDEA_TYPE_LABELS[type] || type
  }

  const removeComment = (index: number) => {
    const newComments = parsedComments.filter((_, i) => i !== index)
    if (newComments.length === 0) {
      setPastedComments("")
      setParsedComments([])
    } else {
      setPastedComments(newComments.map(c => c.text).join("\n"))
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
            onClick={() => {
              setImportMode(importMode === "csv" ? null : "csv")
              if (importMode !== "csv" && fileInputRef.current) {
                fileInputRef.current.click()
              }
            }}
            className="flex items-center gap-3 p-4 border-2 border-slate-600 rounded-lg hover:border-purple-400 transition text-left"
          >
            <Upload className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium text-white">Upload CSV</p>
              <p className="text-sm text-slate-400">Import from file</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
        </div>

        {importMode === "paste" && (
          <div className="space-y-4">
            <div>
              <textarea
                value={pastedComments}
                onChange={(e) => setPastedComments(e.target.value)}
                placeholder="Paste comments here, one per line or as JSON array..."
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded text-white p-3 focus:border-blue-400 focus:outline-none"
              />
            </div>
            
            {/* Show parsed comments as tags */}
            {parsedComments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  {parsedComments.length} comment{parsedComments.length !== 1 ? 's' : ''} ready to import:
                </p>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700 max-h-48 overflow-y-auto">
                  {parsedComments.map((comment, index) => (
                    <div
                      key={index}
                      className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-[lab(33_35.57_-75.79)]/20 border border-[lab(33_35.57_-75.79)]/30 rounded-lg text-sm text-[lab(33_35.57_-75.79)]"
                    >
                      <span className="max-w-xs truncate">{comment.text}</span>
                      <button
                        onClick={() => removeComment(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleImport}
                disabled={importing || !pastedComments.trim()}
                variant="outline"
                className="border-[lab(33_35.57_-75.79)]/50 text-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/10"
              >
                {importing ? "Importing..." : "Import Comments"}
              </Button>
              <Button
                onClick={() => {
                  setPastedComments("")
                  setParsedComments([])
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

        {importMode === "csv" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">
                Click the "Upload CSV" button above to select a CSV file.
              </p>
              <p className="text-xs text-slate-500">
                CSV format: First column should contain comment text, optional second column for author name.
              </p>
            </div>
            <Button
              onClick={() => {
                setImportMode(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
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
                    disabled={analyzing === batch._id || generatingIdeas}
                    variant="outline"
                    className="border-purple-600/50 text-purple-300 hover:text-purple-300 hover:bg-purple-600/10"
                    size="sm"
                  >
                    {analyzing === batch._id ? "Analyzing..." : generatingIdeas ? "Generating..." : "Analyze for Ideas"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No comment batches yet. Import your first batch above.</p>
        )}
      </Card>

      {/* Generated Ideas Modal */}
      <Dialog open={showIdeasModal} onOpenChange={setShowIdeasModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Generated Content Ideas</DialogTitle>
            <DialogDescription className="text-slate-400">
              {generatedIdeas.length} AI-generated ideas based on your audience analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {generatedIdeas.map((idea) => (
              <Card key={idea._id} className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                    {getIdeaTypeIcon(idea.ideaType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{idea.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                          <span className="px-2 py-1 bg-slate-700/50 rounded">
                            {getIdeaTypeLabel(idea.ideaType)}
                          </span>
                          {idea.tierTarget && idea.tierTarget !== "all" && (
                            <span className="px-2 py-1 bg-blue-700/30 rounded text-blue-300">
                              Tier {idea.tierTarget}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-3">{idea.description}</p>
                    {idea.outline && idea.outline.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-400 mb-2">Content Outline:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                          {idea.outline.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowIdeasModal(false)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowIdeasModal(false)
                window.location.href = "/creator/ideas"
              }}
              variant="outline"
              className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10"
            >
              View All Ideas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
