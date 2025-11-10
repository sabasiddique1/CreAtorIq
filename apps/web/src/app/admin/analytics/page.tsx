"use client"

import { useEffect, useState } from "react"
import { Card } from "../../../components/ui/card"
import { graphqlQuery } from "../../../lib/graphql"
import { TrendingUp, Users, FileText, MessageSquare, Lightbulb } from "lucide-react"

interface PlatformStats {
  totalUsers: number
  totalCreators: number
  totalSubscribers: number
  totalContentItems: number
  totalCommentBatches: number
  totalSentimentSnapshots: number
  usersByRole: {
    ADMIN?: number
    CREATOR?: number
    SUBSCRIBER_T1?: number
    SUBSCRIBER_T2?: number
    SUBSCRIBER_T3?: number
  }
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await graphqlQuery(`
          query {
            platformStats {
              totalUsers
              totalCreators
              totalSubscribers
              totalContentItems
              totalCommentBatches
              totalSentimentSnapshots
              usersByRole
            }
          }
        `)

        if (result?.platformStats) {
          setStats(result.platformStats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">Platform metrics and insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Growth Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Total Users</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Active Creators</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalCreators || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">Total Subscribers</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalSubscribers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300">Content Items</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalContentItems || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Engagement Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">Comment Batches</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalCommentBatches || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-orange-400" />
                <span className="text-slate-300">Sentiment Analyses</span>
              </div>
              <span className="text-white font-semibold text-lg">{stats?.totalSentimentSnapshots || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Avg Content per Creator</span>
              </div>
              <span className="text-white font-semibold text-lg">
                {stats?.totalCreators
                  ? Math.round((stats.totalContentItems || 0) / stats.totalCreators)
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Avg Subscribers per Creator</span>
              </div>
              <span className="text-white font-semibold text-lg">
                {stats?.totalCreators
                  ? Math.round((stats.totalSubscribers || 0) / stats.totalCreators)
                  : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* User Distribution */}
      {stats?.usersByRole && (
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">User Distribution by Role</h2>
          <div className="space-y-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => {
              const total = stats.totalUsers || 1
              const percentage = ((count / total) * 100).toFixed(1)
              return (
                <div key={role}>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300 font-medium">{role.replace("SUBSCRIBER_", "Sub ")}</span>
                    <span className="text-white font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Additional Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Content Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Content Items</span>
              <span className="text-white font-semibold">{stats?.totalContentItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Creators</span>
              <span className="text-white font-semibold">{stats?.totalCreators || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Content per Creator</span>
              <span className="text-white font-semibold">
                {stats?.totalCreators
                  ? (stats.totalContentItems || 0) / stats.totalCreators
                  : 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Engagement Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Comment Batches</span>
              <span className="text-white font-semibold">{stats?.totalCommentBatches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sentiment Analyses</span>
              <span className="text-white font-semibold">{stats?.totalSentimentSnapshots || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Analysis Rate</span>
              <span className="text-white font-semibold">
                {stats?.totalCommentBatches
                  ? ((stats.totalSentimentSnapshots || 0) / stats.totalCommentBatches * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

