"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../../../components/ui/card"
import { Activity, Clock, Users, FileText } from "lucide-react"
import { graphqlQuery } from "../../../lib/graphql"
import { formatDistanceToNow } from "date-fns"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart"
import { XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { ActivityEvent, ActivityStats } from "../../../types"
import { ACTIVITY_COLORS, ACTIVITY_ICONS, ACTIVITY_LABELS } from "../../../constants"
import { useAuthStore } from "../../../hooks/use-auth-store"

export default function ActivityLogsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  const fetchActivities = async () => {
    if (!user || user.role !== "ADMIN") {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const filters = selectedEventType 
        ? { eventType: selectedEventType, limit: 100 }
        : { limit: 100 }

      const [activitiesResult, statsResult] = await Promise.all([
        graphqlQuery(
          `
          query AllActivities($filters: ActivityFilterInput) {
            allActivities(filters: $filters) {
              _id
              creatorId
              creator {
                _id
                displayName
                niche
              }
              userId
              user {
                _id
                name
                email
                role
              }
              eventType
              metadata
              createdAt
            }
          }
        `,
          { filters }
        ),
        graphqlQuery(`
          query {
            activityStats {
              byEventType {
                _id
                count
              }
              timeline {
                _id {
                  year
                  month
                  day
                }
                count
              }
            }
          }
        `),
      ])

      if (activitiesResult?.allActivities) {
        setActivities(activitiesResult.allActivities)
      } else {
        setActivities([])
      }
      if (statsResult?.activityStats) {
        setStats(statsResult.activityStats)
      } else {
        setStats(null)
      }
    } catch (error: any) {
      console.error("❌ Error fetching activities:", error)
      console.error("Error stack:", error.stack)
      const errorMessage = error?.message || error?.toString() || "Failed to fetch activities"
      setError(errorMessage + ". Please ensure you are logged in as an admin user.")
      setActivities([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchActivities()
      // Poll for new activities every 5 seconds
      const interval = setInterval(fetchActivities, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedEventType, user])

  const getEventColor = (eventType: string) => {
    return ACTIVITY_COLORS[eventType as keyof typeof ACTIVITY_COLORS] || "#6B7280"
  }

  const getEventIcon = (eventType: string) => {
    const Icon = ACTIVITY_ICONS[eventType] || Activity
    return Icon
  }

  const chartData = stats?.byEventType.map((item) => ({
    name: ACTIVITY_LABELS[item._id] || item._id,
    value: item.count,
    color: getEventColor(item._id),
  })) || []

  const timelineData = stats?.timeline
    .map((item) => ({
      date: `${item._id.month}/${item._id.day}`,
      count: item.count,
    }))
    .slice(-30) || []

  const eventTypeCounts = stats?.byEventType.reduce((acc, item) => {
    acc[item._id] = item.count
    return acc
  }, {} as Record<string, number>) || {}

  if (!user || user.role !== "ADMIN") {
    return null
  }

  if (loading && activities.length === 0 && !error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
          <p className="text-slate-400">Track platform activity and user actions</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-slate-500 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400">Loading activities...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
        <p className="text-slate-400">Real-time platform activity and user actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(eventTypeCounts).slice(0, 4).map(([eventType, count]) => {
          const Icon = getEventIcon(eventType)
          return (
            <Card key={eventType} className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{ACTIVITY_LABELS[eventType] || eventType}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${getEventColor(eventType)}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: getEventColor(eventType) }} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Type Distribution */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Distribution</h2>
          {chartData.length > 0 ? (
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </Card>

        {/* Timeline Chart */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Timeline (Last 30 Days)</h2>
          {timelineData.length > 0 ? (
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "#475569" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border-red-700 p-4">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-sm text-red-300 mt-2">Make sure you are logged in as an admin user.</p>
        </Card>
      )}

      {/* Activity List */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
          <select
            value={selectedEventType || ""}
            onChange={(e) => setSelectedEventType(e.target.value || null)}
            className="px-3 py-2 bg-slate-900 border border-slate-600 text-white rounded text-sm"
          >
            <option value="">All Events</option>
            {Object.keys(ACTIVITY_LABELS).map((eventType) => (
              <option key={eventType} value={eventType}>
                {ACTIVITY_LABELS[eventType]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getEventIcon(activity.eventType)
              const color = getEventColor(activity.eventType)
              return (
                <div
                  key={activity._id}
                  className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {ACTIVITY_LABELS[activity.eventType] || activity.eventType}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          {activity.user && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {activity.user.name} ({activity.user.role})
                            </span>
                          )}
                          {activity.creator && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              {activity.creator.displayName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {Object.keys(activity.metadata || {}).length > 0 && (
                          <div className="mt-2 text-xs text-slate-500">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No activities found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
