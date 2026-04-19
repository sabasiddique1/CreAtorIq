"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Sparkles, TrendingUp, Users, Calendar, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { graphqlQuery } from "../../../lib/graphql"
import { useToast } from "../../../hooks/use-toast"
import type { SentimentSnapshot, CommentBatch, IdeaSuggestion, SnapshotWithIdeas } from "../../../types"
import { IDEA_TYPE_ICONS, IDEA_TYPE_LABELS, IDEA_STATUS_LABELS, IDEA_STATUS_COLORS } from "../../../constants"

export default function IdeasPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [snapshots, setSnapshots] = useState<SentimentSnapshot[]>([])
  const [batches, setBatches] = useState<Record<string, CommentBatch>>({})
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotWithIdeas | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<IdeaSuggestion | null>(null)
  const [expandedSnapshots, setExpandedSnapshots] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
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
        const creatorId = profileResult.myCreatorProfile._id

        const snapshotsResult = await graphqlQuery(
          `
          query {
            sentimentSnapshots(creatorId: "${creatorId}", filter: {}) {
              _id
              commentBatchId
              overallSentimentScore
              positiveCount
              negativeCount
              neutralCount
              topKeywords
              topRequests
              createdAt
            }
          }
        `
        )

        if (snapshotsResult?.sentimentSnapshots) {
          setSnapshots(snapshotsResult.sentimentSnapshots)
          
          const batchIds = [...new Set(snapshotsResult.sentimentSnapshots.map((s: SentimentSnapshot) => s.commentBatchId))] as string[]
          
          // Fetch all batches in parallel for better performance
          const batchPromises = batchIds.map(async (batchId) => {
            try {
              const batchResult = await graphqlQuery(`
                query {
                  commentBatch(id: "${batchId}") {
                    _id
                    source
                    rawComments
                    importedAt
                  }
                }
              `)
              return batchResult?.commentBatch ? { batchId, batch: batchResult.commentBatch as CommentBatch } : null
            } catch (error) {
              console.error(`Error fetching batch ${batchId}:`, error)
              return null
            }
          })
          
          const batchResults = await Promise.all(batchPromises)
          const batchesMap: Record<string, CommentBatch> = {}
          batchResults.forEach((result) => {
            if (result) {
              batchesMap[result.batchId] = result.batch
            }
          })
          setBatches(batchesMap)
        }

        const ideasResult = await graphqlQuery(
          `
          query {
            ideaSuggestions(creatorId: "${creatorId}", filter: {}) {
              _id
              title
              description
              ideaType
              tierTarget
              outline
              status
              sourceSnapshotId
              createdAt
            }
          }
        `
        )

        if (ideasResult?.ideaSuggestions) {
          setIdeas(ideasResult.ideaSuggestions)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateIdeas = async (snapshotId: string) => {
    if (!user) return

    setGenerating(snapshotId)
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
            sourceSnapshotId
          }
        }
      `
      )

      if (result?.generateIdeas) {
        if (result.generateIdeas.length === 0) {
          toast({
            title: "No ideas generated",
            description: "This might be due to missing API key or insufficient data.",
            variant: "destructive",
          })
        } else {
          await fetchData()
          toast({
            title: "Ideas generated",
            description: `Successfully generated ${result.generateIdeas.length} content ideas!`,
          })
        }
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error)
      toast({
        title: "Generation failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setGenerating(null)
    }
  }

  const getIdeaTypeIcon = (type: string) => {
    const Icon = IDEA_TYPE_ICONS[type] || IDEA_TYPE_ICONS.default
    return <Icon className="w-5 h-5" />
  }

  const getIdeaTypeLabel = (type: string) => {
    return IDEA_TYPE_LABELS[type] || type
  }

  const getStatusLabel = (status: string) => {
    return IDEA_STATUS_LABELS[status] || status
  }

  const getStatusColor = (status: string) => {
    return IDEA_STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const organizeBySnapshot = (): SnapshotWithIdeas[] => {
    const organized: SnapshotWithIdeas[] = []
    
    snapshots.forEach((snapshot) => {
      const snapshotIdeas = ideas.filter((idea) => idea.sourceSnapshotId === snapshot._id)
      organized.push({
        snapshot,
        batch: (batches as Record<string, CommentBatch>)[snapshot.commentBatchId] || null,
        ideas: snapshotIdeas,
      })
    })
    
    return organized.sort((a, b) => 
      new Date(b.snapshot.createdAt).getTime() - new Date(a.snapshot.createdAt).getTime()
    )
  }

  const snapshotGroups = organizeBySnapshot()
  const toggleSnapshot = (snapshotId: string) => {
    const newExpanded = new Set(expandedSnapshots)
    if (newExpanded.has(snapshotId)) {
      newExpanded.delete(snapshotId)
    } else {
      newExpanded.add(snapshotId)
    }
    setExpandedSnapshots(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-8 px-6 py-8 min-h-full bg-paper-system">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Monetization Ideas</h1>
          <p className="text-gray-600">AI-generated content ideas based on your audience sentiment.</p>
        </div>
        <Card className="bg-white border-gray-200 p-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-6 py-8 min-h-full bg-paper-system">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Monetization Ideas</h1>
        <p className="text-gray-600">AI-generated content ideas organized by comment analysis.</p>
      </div>

      {/* Generate Ideas Section */}
      {snapshots.length > 0 ? (
        <Card className="bg-white border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Ideas from Analysis</h2>
          <div className="space-y-4">
            {snapshots.map((snapshot) => {
              const snapshotIdeas = ideas.filter((idea) => idea.sourceSnapshotId === snapshot._id)
              const batch = batches[snapshot.commentBatchId]
              
              return (
                <div key={snapshot._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-gray-900 font-medium">
                          Sentiment Score: {(snapshot.overallSentimentScore * 100).toFixed(0)}%
                        </span>
                        {snapshotIdeas.length > 0 && (
                          <span className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                            {snapshotIdeas.length} ideas
                          </span>
                        )}
                      </div>
                      {batch && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>{batch.rawComments.length} comments</span>
                          <span className="text-gray-400">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(batch.importedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          {snapshot.positiveCount} positive
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-red-400 rotate-180" />
                          {snapshot.negativeCount} negative
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {snapshot.neutralCount} neutral
                        </span>
                      </div>
                      {snapshot.topKeywords.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Top Keywords:</p>
                          <div className="flex flex-wrap gap-2">
                            {snapshot.topKeywords.slice(0, 5).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {snapshotIdeas.length > 0 && (
                        <Button
                          onClick={() => {
                            const group = snapshotGroups.find(g => g.snapshot._id === snapshot._id)
                            if (group) {
                              setSelectedSnapshot(group)
                            }
                          }}
                          variant="outline"
                          className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                          size="sm"
                        >
                          View Ideas ({snapshotIdeas.length})
                        </Button>
                      )}
                      <Button
                        onClick={() => handleGenerateIdeas(snapshot._id)}
                        disabled={generating === snapshot._id}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        {generating === snapshot._id ? "Generating..." : "Generate Ideas"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expandable ideas preview */}
                  {snapshotIdeas.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => toggleSnapshot(snapshot._id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition w-full"
                      >
                        {expandedSnapshots.has(snapshot._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>Show {snapshotIdeas.length} idea{snapshotIdeas.length !== 1 ? 's' : ''} for this analysis</span>
                      </button>
                      
                      {expandedSnapshots.has(snapshot._id) && (
                        <div className="mt-3 space-y-2">
                          {snapshotIdeas.map((idea) => (
                            <Card key={idea._id} className="bg-gray-50 border-gray-200 p-3">
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded text-primary">
                                  {getIdeaTypeIcon(idea.ideaType)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{idea.title}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">{idea.description}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <Card className="bg-white border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sentiment Analysis Yet</h3>
          <p className="text-gray-600 mb-6">
            Import and analyze audience comments first to generate personalized content ideas.
          </p>
          <Link href="/creator/audience">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Go to Audience Analysis
            </Button>
          </Link>
        </Card>
      )}

      {/* Ideas Modal with Tabs */}
      {selectedSnapshot && (
        <Dialog open={!!selectedSnapshot} onOpenChange={() => setSelectedSnapshot(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Ideas from {selectedSnapshot.batch ? new Date(selectedSnapshot.batch.importedAt).toLocaleDateString() : 'Analysis'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedSnapshot.ideas.length} AI-generated ideas based on {selectedSnapshot.batch?.rawComments.length || 0} comments
              </DialogDescription>
            </DialogHeader>
            
            {selectedSnapshot.ideas.length === 3 ? (
              <Tabs defaultValue="0" className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  {selectedSnapshot.ideas.map((idea, index) => (
                    <TabsTrigger 
                      key={idea._id} 
                      value={index.toString()}
                      className="text-xs sm:text-sm"
                    >
                      {getIdeaTypeIcon(idea.ideaType)}
                      <span className="ml-2 truncate">{idea.title.substring(0, 15)}...</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {selectedSnapshot.ideas.map((idea, index) => (
                  <TabsContent key={idea._id} value={index.toString()} className="mt-4">
                    <Card 
                      className="bg-white border-gray-200 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedIdea(idea)
                        setSelectedSnapshot(null)
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                          {getIdeaTypeIcon(idea.ideaType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                <span className={`px-2 py-1 rounded border ${getStatusColor(idea.status)}`}>
                                  {getStatusLabel(idea.status)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full font-medium">
                                  {getIdeaTypeLabel(idea.ideaType)}
                                </span>
                                {idea.tierTarget && idea.tierTarget !== "all" && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
                                    Tier {idea.tierTarget}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{idea.description}</p>
                          {idea.outline && idea.outline.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Content Outline:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {idea.outline.map((point, idx) => (
                                  <li key={idx}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">Click to view full details</p>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-4 mt-4">
                {selectedSnapshot.ideas.map((idea) => (
                  <Card key={idea._id} className="bg-white border-gray-200 p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getIdeaTypeIcon(idea.ideaType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              <span className={`px-2 py-1 rounded border ${getStatusColor(idea.status)}`}>
                                {getStatusLabel(idea.status)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full font-medium">
                                {getIdeaTypeLabel(idea.ideaType)}
                              </span>
                              {idea.tierTarget && idea.tierTarget !== "all" && (
                                <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
                                  Tier {idea.tierTarget}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{idea.description}</p>
                        {idea.outline && idea.outline.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Content Outline:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
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
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setSelectedSnapshot(null)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:text-gray-900"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Individual Idea Modal */}
      {selectedIdea && (
        <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{selectedIdea.title}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {getIdeaTypeLabel(selectedIdea.ideaType)} • {getStatusLabel(selectedIdea.status)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <Card className="bg-white border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getIdeaTypeIcon(selectedIdea.ideaType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                      <span className={`px-2 py-1 rounded-full border ${getStatusColor(selectedIdea.status)}`}>
                        {getStatusLabel(selectedIdea.status)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full font-medium">
                        {getIdeaTypeLabel(selectedIdea.ideaType)}
                      </span>
                      {selectedIdea.tierTarget && selectedIdea.tierTarget !== "all" && (
                        <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
                          Tier {selectedIdea.tierTarget}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 text-lg">{selectedIdea.description}</p>
                    {selectedIdea.outline && selectedIdea.outline.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-3">Content Outline:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                          {selectedIdea.outline.map((point, idx) => (
                            <li key={idx} className="text-base">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setSelectedIdea(null)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:text-gray-900"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {ideas.length === 0 && snapshots.length > 0 && (
        <Card className="bg-white border-gray-200 p-6">
          <p className="text-gray-600 text-center">
            No ideas generated yet. Click "Generate Ideas" above to create AI-powered content suggestions.
          </p>
        </Card>
      )}
    </div>
  )
}
