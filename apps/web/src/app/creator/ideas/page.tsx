"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Sparkles, Lightbulb, TrendingUp, Users, Video, BookOpen, MessageCircle, Target } from "lucide-react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { graphqlQuery } from "../../../lib/graphql"

interface SentimentSnapshot {
  _id: string
  overallSentimentScore: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  topKeywords: string[]
  topRequests: string[]
  createdAt: string
}

interface IdeaSuggestion {
  _id: string
  title: string
  description: string
  ideaType: string
  tierTarget: string
  outline: string[]
  status: string
  createdAt: string
}

export default function IdeasPage() {
  const { user } = useAuthStore()
  const [snapshots, setSnapshots] = useState<SentimentSnapshot[]>([])
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
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
        const creatorId = profileResult.myCreatorProfile._id

        // Fetch sentiment snapshots
        const snapshotsResult = await graphqlQuery(
          `
          query {
            sentimentSnapshots(creatorId: "${creatorId}", filter: {}) {
              _id
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
        }

        // Fetch existing ideas
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
      console.log("Generating ideas for snapshot:", snapshotId)
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

      console.log("Generate ideas result:", result)

      if (result?.generateIdeas) {
        if (result.generateIdeas.length === 0) {
          alert("No ideas were generated. This might be due to missing OpenAI API key or insufficient data. Check the console for details.")
        } else {
          // Refresh ideas list
          await fetchData()
          alert(`Successfully generated ${result.generateIdeas.length} content ideas!`)
        }
      } else {
        alert("No ideas were generated. Check the console for errors.")
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error)
      const errorMessage = error.message || "Unknown error"
      alert(`Error generating ideas: ${errorMessage}\n\nMake sure OPENAI_API_KEY is set in the API .env file.`)
    } finally {
      setGenerating(null)
    }
  }

  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />
      case "mini-course":
        return <BookOpen className="w-5 h-5" />
      case "live_qa":
        return <MessageCircle className="w-5 h-5" />
      case "community_challenge":
        return <Target className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getIdeaTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video"
      case "mini-course":
        return "Mini Course"
      case "live_qa":
        return "Live Q&A"
      case "community_challenge":
        return "Community Challenge"
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New"
      case "saved":
        return "Saved"
      case "implemented":
        return "Implemented"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-700/30 text-blue-300 border-blue-700/50"
      case "saved":
        return "bg-yellow-700/30 text-yellow-300 border-yellow-700/50"
      case "implemented":
        return "bg-green-700/30 text-green-300 border-green-700/50"
      default:
        return "bg-slate-700/30 text-slate-300 border-slate-700/50"
    }
  }

  // Organize ideas by status, then by type
  const organizeIdeas = (ideas: IdeaSuggestion[]) => {
    const organized: Record<string, Record<string, IdeaSuggestion[]>> = {}
    
    ideas.forEach((idea) => {
      const status = idea.status || "new"
      const type = idea.ideaType || "other"
      
      if (!organized[status]) {
        organized[status] = {}
      }
      if (!organized[status][type]) {
        organized[status][type] = []
      }
      
      organized[status][type].push(idea)
    })
    
    return organized
  }

  const organizedIdeas = organizeIdeas(ideas)
  const statusOrder = ["new", "saved", "implemented"]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Monetization Ideas</h1>
          <p className="text-slate-400">AI-generated content ideas based on your audience sentiment.</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Monetization Ideas</h1>
        <p className="text-slate-400">AI-generated content ideas based on your audience sentiment.</p>
      </div>

      {/* Generate Ideas Section */}
      {snapshots.length > 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Generate Ideas from Analysis</h2>
          <div className="space-y-4">
            {snapshots.map((snapshot) => (
              <div key={snapshot._id} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">
                        Sentiment Score: {(snapshot.overallSentimentScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                        {snapshot.positiveCount} positive
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-red-400 rotate-180" />
                        {snapshot.negativeCount} negative
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {snapshot.neutralCount} neutral
                      </span>
                    </div>
                    {snapshot.topKeywords.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Top Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {snapshot.topKeywords.slice(0, 5).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {snapshot.topRequests.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">What Audience Wants:</p>
                        <div className="flex flex-wrap gap-2">
                          {snapshot.topRequests.slice(0, 3).map((request, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-700/30 rounded text-xs text-purple-300"
                            >
                              {request}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleGenerateIdeas(snapshot._id)}
                    disabled={generating === snapshot._id}
                    variant="outline"
                    className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10"
                  >
                    {generating === snapshot._id ? "Generating..." : "Generate Ideas"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Sentiment Analysis Yet</h3>
          <p className="text-slate-400 mb-6">
            Import and analyze audience comments first to generate personalized content ideas.
          </p>
          <Link href="/creator/audience">
            <Button variant="outline" className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10">
              Go to Audience Analysis
            </Button>
          </Link>
        </Card>
      )}

      {/* Generated Ideas List - Organized by Status and Type */}
      {ideas.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Generated Ideas</h2>
          
          {statusOrder.map((status) => {
            if (!organizedIdeas[status] || Object.keys(organizedIdeas[status]).length === 0) {
              return null
            }

            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{getStatusLabel(status)} Ideas</h3>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(status)}`}>
                    {Object.values(organizedIdeas[status]).flat().length} total
                  </span>
                </div>

                {Object.entries(organizedIdeas[status]).map(([type, typeIdeas]) => (
                  <div key={type} className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      {getIdeaTypeIcon(type)}
                      {getIdeaTypeLabel(type)} ({typeIdeas.length})
                    </h4>
                    <div className="grid gap-4">
                      {typeIdeas.map((idea) => (
                        <Card key={idea._id} className="bg-slate-800/50 border-slate-700 p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                              {getIdeaTypeIcon(idea.ideaType)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-white mb-1">{idea.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                                    <span className={`px-2 py-1 rounded border ${getStatusColor(idea.status)}`}>
                                      {getStatusLabel(idea.status)}
                                    </span>
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
                              <p className="text-slate-300 mb-4">{idea.description}</p>
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
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {ideas.length === 0 && snapshots.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <p className="text-slate-400 text-center">
            No ideas generated yet. Click "Generate Ideas" above to create AI-powered content suggestions.
          </p>
        </Card>
      )}
    </div>
  )
}
