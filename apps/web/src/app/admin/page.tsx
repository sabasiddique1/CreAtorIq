"use client"

import { useEffect, useState, Suspense } from "react"
import { Card } from '../../components/ui/card'
import { Users, Calendar, Mail } from "lucide-react"
import { graphqlQuery } from '../../lib/graphql'
import Link from "next/link"
import { ADMIN_STATS } from '../../constants'

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

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface ContentItem {
  _id: string
  title: string
  type: string
  status: string
  createdAt: string
  creator?: {
    displayName: string
  }
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, usersResult, contentResult] = await Promise.all([
          graphqlQuery(`
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
          `),
          graphqlQuery(`
            query {
              allUsers {
                _id
                name
                email
                role
                createdAt
              }
            }
          `),
          graphqlQuery(`
            query {
              allContentItems {
                _id
                title
                type
                status
                createdAt
                creator {
                  displayName
                }
              }
            }
          `),
        ])

        if (statsResult?.platformStats) {
          setStats(statsResult.platformStats)
        }
        if (usersResult?.allUsers) {
          setRecentUsers(usersResult.allUsers.slice(0, 5))
        }
        if (contentResult?.allContentItems) {
          setRecentContent(contentResult.allContentItems.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ADMIN_STATS.map((stat) => {
          const Icon = stat.icon
          const value = stats?.[stat.key as keyof PlatformStats] as number || 0
          return (
            <Card key={stat.key} className="bg-white border-gray-200 p-6 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <Icon className={`w-10 h-10 ${stat.iconColor} opacity-60`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Users by Role */}
      {stats?.usersByRole && (
        <Card className="bg-white border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Users by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center">
                <p className="text-gray-600 text-sm mb-1">{role.replace("SUBSCRIBER_", "Sub ")}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Users */}
      <Card className="bg-white border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
          <Link
            href="/admin/users"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {recentUsers.length > 0 ? (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-3 h-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {user.role.replace("SUBSCRIBER_", "Sub ")}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No users yet</p>
        )}
      </Card>

      {/* Recent Content */}
      <Card className="bg-white border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Content</h2>
          <Link
            href="/admin/content"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {recentContent.length > 0 ? (
          <div className="space-y-3">
            {recentContent.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-1">{item.title}</p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      {item.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        item.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.creator?.displayName && (
                      <span className="text-gray-500">by {item.creator.displayName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs ml-4">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No content yet</p>
        )}
      </Card>

      {/* System Status */}
      <Card className="bg-white border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Status</h2>
            <p className="text-gray-600">All systems operational</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>
      </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
