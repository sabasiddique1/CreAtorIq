"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { Card } from "../../../components/ui/card"
import { Users, TrendingUp, FileText } from "lucide-react"
import { graphqlQuery, GET_CREATOR_OVERVIEW } from "../../../lib/graphql"
import {
  ChartContainer,
  ChartTooltip,
} from "../../../components/ui/chart"
import { Area, AreaChart, Pie, PieChart, Cell, Legend, CartesianGrid, XAxis, YAxis } from "recharts"

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
    neutralCount?: number
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

        const overview = await graphqlQuery(GET_CREATOR_OVERVIEW, {
          creatorId: creatorProfile._id,
        })

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

  // Prepare chart data
  const tierData = data?.subscribersByTier
    ? [
        { name: "T1", value: data.subscribersByTier.T1, fill: "#3b82f6" },
        { name: "T2", value: data.subscribersByTier.T2, fill: "#8b5cf6" },
        { name: "T3", value: data.subscribersByTier.T3, fill: "#ec4899" },
      ]
    : []

  // Generate trend data for sentiment over time (mock data for now)
  const sentimentTrendData = [
    { month: "Jan", score: 0.65 },
    { month: "Feb", score: 0.72 },
    { month: "Mar", score: 0.68 },
    { month: "Apr", score: 0.75 },
    { month: "May", score: data?.latestSentimentTrend?.overallSentimentScore || 0.70 },
  ]

  if (loading) {
    return <div className="px-6 py-8 text-muted-foreground">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8 px-6 py-8 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your community overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 hover:border-primary/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Total Subscribers</p>
              <p className="text-3xl font-semibold text-foreground">
                {data?.totalSubscribers || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-primary/40" />
          </div>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 hover:border-primary/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Audience Sentiment</p>
              <p className="text-3xl font-semibold text-foreground">
                {data?.latestSentimentTrend
                  ? `${(data.latestSentimentTrend.overallSentimentScore * 100).toFixed(0)}%`
                  : "--"}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary/40" />
          </div>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 hover:border-primary/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Content Items</p>
              <p className="text-3xl font-semibold text-foreground">
                {data?.recentContent?.length || 0}
              </p>
            </div>
            <FileText className="w-10 h-10 text-primary/40" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sentiment Trend Chart */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">Sentiment Trend</h2>
          {data?.latestSentimentTrend ? (
            <ChartContainer
              config={{
                score: {
                  label: "Sentiment Score",
                  color: "#10b981",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={sentimentTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/30 bg-background/90 backdrop-blur-sm p-3 shadow-lg">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground text-sm">Score</span>
                              <span className="font-semibold text-primary">
                                {((payload[0].value as number) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center border border-border/50">
              <p className="text-muted-foreground">Import comments to see sentiment trends</p>
            </div>
          )}
        </Card>

        {/* Subscribers by Tier Chart */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">Subscribers by Tier</h2>
          {tierData.length > 0 && tierData.some(t => t.value > 0) ? (
            <ChartContainer
              config={{
                T1: {
                  label: "Tier 1",
                  color: "#3b82f6",
                },
                T2: {
                  label: "Tier 2",
                  color: "#8b5cf6",
                },
                T3: {
                  label: "Tier 3",
                  color: "#ec4899",
                },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]
                      return (
                        <div className="rounded-lg border border-border/30 bg-background/90 backdrop-blur-sm p-3 shadow-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.payload.fill }}
                            />
                            <span className="text-foreground font-medium">{data.name}</span>
                          </div>
                          <div className="text-foreground text-sm">
                            {data.value} subscriber{data.value !== 1 ? 's' : ''}
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            {((data.payload.percent || 0) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center border border-border/50">
              <p className="text-muted-foreground">No subscribers yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Sentiment Breakdown */}
      {data?.latestSentimentTrend && (
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">Sentiment Breakdown</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="text-muted-foreground">Overall Score</span>
              <span className="text-2xl font-semibold text-primary">
                {(data.latestSentimentTrend.overallSentimentScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-5 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-sm mb-2">Positive</p>
                <p className="text-2xl font-semibold text-primary">{data.latestSentimentTrend.positiveCount}</p>
              </div>
              <div className="text-center p-5 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-sm mb-2">Negative</p>
                <p className="text-2xl font-semibold text-destructive">{data.latestSentimentTrend.negativeCount}</p>
              </div>
              <div className="text-center p-5 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-sm mb-2">Neutral</p>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {data.latestSentimentTrend.neutralCount || 0}
                </p>
              </div>
            </div>
            {data.latestSentimentTrend.topKeywords.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm mb-3">Top Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {data.latestSentimentTrend.topKeywords.slice(0, 5).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-5">Recent Content</h3>
          {data?.recentContent && data.recentContent.length > 0 ? (
            <div className="space-y-4">
              {data.recentContent.slice(0, 3).map((item) => (
                <div key={item._id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <p className="text-foreground font-medium mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.type} • {item.isPremium ? "Premium" : "Free"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No content yet. Create your first item to get started.</p>
          )}
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/30 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-5">Suggested Ideas</h3>
          {data?.suggestedIdeas && data.suggestedIdeas.length > 0 ? (
            <div className="space-y-4">
              {data.suggestedIdeas.slice(0, 3).map((idea) => (
                <div key={idea._id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <p className="text-foreground font-medium mb-1.5">{idea.title}</p>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{idea.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-md font-medium">
                      {idea.ideaType.replace("_", " ")}
                    </span>
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md font-medium">
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))}
              {data.suggestedIdeas.length > 3 && (
                <p className="text-muted-foreground text-sm mt-2">
                  +{data.suggestedIdeas.length - 3} more ideas
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No ideas yet. Generate ideas from the Ideas page after analyzing comments.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
