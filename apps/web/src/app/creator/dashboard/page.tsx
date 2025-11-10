"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Users, TrendingUp, FileText } from "lucide-react"
import { graphqlQuery, GET_CREATOR_OVERVIEW } from "../../../lib/graphql"

interface CreatorData {
  creator: {
    _id: string
    displayName: string
    niche: string
    bio: string
  }
  totalSubscribers: number
  subscribersByTier: { T1: number; T2: number; T3: number }
  recentContent: Array<{
    _id: string
    title: string
    type: string
    status: string
    isPremium: boolean
    createdAt: string
  }>
  latestSentimentTrend?: {
    overallSentimentScore: number
    positiveCount: number
    negativeCount: number
    topKeywords: string[]
  }
  suggestedIdeas: Array<{
    _id: string
    title: string
    description: string
    ideaType: string
    status: string
    createdAt: string
  }>
}

export default function CreatorDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<CreatorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get the creator profile for the current user
        const profileResult = await graphqlQuery(`
          query {
            myCreatorProfile {
              _id
              displayName
              bio
              niche
            }
          }
        `)

        const creatorProfile = profileResult.myCreatorProfile
        if (!creatorProfile) {
          setLoading(false)
          return
        }

        // Get creator overview
        const overview = await graphqlQuery(GET_CREATOR_OVERVIEW, {
          creatorId: creatorProfile._id,
        })

        // Get suggested ideas
        const ideasResult = await graphqlQuery(
          `
          query {
            ideaSuggestions(creatorId: "${creatorProfile._id}", filter: { status: "new" }) {
              _id
              title
              description
              ideaType
              status
              createdAt
            }
          }
        `
        )

        if (overview?.creatorOverview) {
          setData({
            creator: overview.creatorOverview.creator,
            totalSubscribers: overview.creatorOverview.totalSubscribers || 0,
            subscribersByTier: overview.creatorOverview.subscribersByTier || { T1: 0, T2: 0, T3: 0 },
            recentContent: overview.creatorOverview.recentContent || [],
            latestSentimentTrend: overview.creatorOverview.latestSentimentTrend,
            suggestedIdeas: ideasResult?.ideaSuggestions || [],
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return <div className="text-slate-300">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your community overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Subscribers</p>
              <p className="text-3xl font-bold text-white">{data?.totalSubscribers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Audience Sentiment</p>
              <p className="text-3xl font-bold text-white">
                {data?.latestSentimentTrend
                  ? `${(data.latestSentimentTrend.overallSentimentScore * 100).toFixed(0)}%`
                  : "--"}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-emerald-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Content Items</p>
              <p className="text-3xl font-bold text-white">{data?.recentContent?.length || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Sentiment Chart Placeholder */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Sentiment Trend</h2>
        {data?.latestSentimentTrend ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Overall Score</span>
              <span className="text-2xl font-bold text-emerald-400">
                {(data.latestSentimentTrend.overallSentimentScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Positive</p>
                <p className="text-xl font-bold text-emerald-400">{data.latestSentimentTrend.positiveCount}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Negative</p>
                <p className="text-xl font-bold text-red-400">{data.latestSentimentTrend.negativeCount}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Neutral</p>
                <p className="text-xl font-bold text-slate-400">
                  {data.latestSentimentTrend.neutralCount || 0}
                </p>
              </div>
            </div>
            {data.latestSentimentTrend.topKeywords.length > 0 && (
              <div>
                <p className="text-slate-400 text-sm mb-2">Top Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {data.latestSentimentTrend.topKeywords.slice(0, 5).map((keyword, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 bg-slate-900/50 rounded flex items-center justify-center">
            <p className="text-slate-400">Import comments to see sentiment trends</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Content</h3>
          {data?.recentContent && data.recentContent.length > 0 ? (
            <div className="space-y-3">
              {data.recentContent.slice(0, 3).map((item) => (
                <div key={item._id} className="border-b border-slate-700 pb-3 last:border-0">
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-slate-400 text-sm">
                    {item.type} • {item.isPremium ? "Premium" : "Free"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No content yet. Create your first item to get started.</p>
          )}
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Suggested Ideas</h3>
          {data?.suggestedIdeas && data.suggestedIdeas.length > 0 ? (
            <div className="space-y-3">
              {data.suggestedIdeas.slice(0, 3).map((idea) => (
                <div key={idea._id} className="border-b border-slate-700 pb-3 last:border-0">
                  <p className="text-white font-medium">{idea.title}</p>
                  <p className="text-slate-400 text-sm line-clamp-2">{idea.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {idea.ideaType.replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))}
              {data.suggestedIdeas.length > 3 && (
                <p className="text-slate-400 text-sm mt-2">
                  +{data.suggestedIdeas.length - 3} more ideas
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-400">No ideas yet. Generate ideas from the Ideas page after analyzing comments.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
