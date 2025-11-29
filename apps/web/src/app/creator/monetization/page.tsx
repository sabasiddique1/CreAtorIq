"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/hooks/use-auth-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { graphqlQuery } from "@/lib/graphql"
import { DollarSign, Users, TrendingUp, Calendar, ArrowUp, ArrowDown, CreditCard } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

interface MonetizationData {
  totalSubscribers: number
  subscribersByTier: {
    T1: number
    T2: number
    T3: number
  }
  monthlyRevenue: number
  totalRevenue: number
  revenueByTier: {
    T1: number
    T2: number
    T3: number
  }
  revenueHistory: Array<{
    month: string
    revenue: number
    subscribers: number
  }>
  recentSubscribers: Array<{
    _id: string
    userId: {
      name: string
      email: string
    }
    tier: string
    createdAt: string
  }>
}

export default function CreatorMonetizationPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MonetizationData | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && !user.role.includes("CREATOR")) {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    const fetchMonetizationData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Get creator profile to get creatorId
        const creatorResult = await graphqlQuery(`
          query {
            myCreatorProfile {
              _id
            }
          }
        `)

        if (!creatorResult?.myCreatorProfile?._id) {
          toast({
            title: "Error",
            description: "Creator profile not found",
            variant: "destructive",
          })
          return
        }

        const creatorId = creatorResult.myCreatorProfile._id

        // Get subscribers
        const subscribersResult = await graphqlQuery(
          `
          query Subscribers($creatorId: ID!) {
            subscribers(creatorId: $creatorId) {
              _id
              userId {
                name
                email
              }
              tier
              createdAt
            }
          }
        `,
          { creatorId }
        )

        // Get subscription tiers
        const tiersResult = await graphqlQuery(
          `
          query SubscriptionTiers($creatorId: ID!) {
            subscriptionTiers(creatorId: $creatorId) {
              _id
              name
              pricePerMonth
            }
          }
        `,
          { creatorId }
        )

        if (subscribersResult?.subscribers && tiersResult?.subscriptionTiers) {
          const subscribers = subscribersResult.subscribers
          const tiers = tiersResult.subscriptionTiers

          // Calculate revenue
          const tierPrices: Record<string, number> = {}
          tiers.forEach((tier: any) => {
            if (tier.name === "Tier 1" || tier.name === "T1") tierPrices.T1 = tier.pricePerMonth
            if (tier.name === "Tier 2" || tier.name === "T2") tierPrices.T2 = tier.pricePerMonth
            if (tier.name === "Tier 3" || tier.name === "T3") tierPrices.T3 = tier.pricePerMonth
          })

          const subscribersByTier = {
            T1: subscribers.filter((s: any) => s.tier === "T1").length,
            T2: subscribers.filter((s: any) => s.tier === "T2").length,
            T3: subscribers.filter((s: any) => s.tier === "T3").length,
          }

          const revenueByTier = {
            T1: subscribersByTier.T1 * (tierPrices.T1 || 0),
            T2: subscribersByTier.T2 * (tierPrices.T2 || 0),
            T3: subscribersByTier.T3 * (tierPrices.T3 || 0),
          }

          const monthlyRevenue = revenueByTier.T1 + revenueByTier.T2 + revenueByTier.T3

          // Generate revenue history (last 6 months)
          const revenueHistory = []
          const now = new Date()
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthSubscribers = subscribers.filter((s: any) => {
              const subDate = new Date(s.createdAt)
              return subDate <= date
            })
            const monthRevenue = monthSubscribers.reduce((sum: number, s: any) => {
              const tierPrice = tierPrices[s.tier] || 0
              return sum + tierPrice
            }, 0)
            revenueHistory.push({
              month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
              revenue: monthRevenue,
              subscribers: monthSubscribers.length,
            })
          }

          // Get recent subscribers (last 10)
          const recentSubscribers = subscribers
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)

          setData({
            totalSubscribers: subscribers.length,
            subscribersByTier,
            monthlyRevenue,
            totalRevenue: monthlyRevenue * 6, // Approximate
            revenueByTier,
            revenueHistory,
            recentSubscribers,
          })
        }
      } catch (error: any) {
        console.error("Error fetching monetization data:", error)
        toast({
          title: "Error",
          description: "Failed to load monetization data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMonetizationData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Loading monetization data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <p className="text-slate-400">No monetization data available</p>
        </Card>
      </div>
    )
  }

  const revenueChange = data.revenueHistory.length >= 2
    ? ((data.revenueHistory[data.revenueHistory.length - 1].revenue - data.revenueHistory[data.revenueHistory.length - 2].revenue) / data.revenueHistory[data.revenueHistory.length - 2].revenue) * 100
    : 0

  const subscriberChange = data.revenueHistory.length >= 2
    ? data.revenueHistory[data.revenueHistory.length - 1].subscribers - data.revenueHistory[data.revenueHistory.length - 2].subscribers
    : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Monetization</h1>
          <p className="text-slate-400">Track your subscribers and revenue</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Monthly Revenue</p>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${data.monthlyRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {revenueChange >= 0 ? (
                <ArrowUp className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-400" />
              )}
              <span className={revenueChange >= 0 ? "text-green-400" : "text-red-400"}>
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Total Subscribers</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {data.totalSubscribers}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {subscriberChange >= 0 ? (
                <ArrowUp className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-400" />
              )}
              <span className={subscriberChange >= 0 ? "text-green-400" : "text-red-400"}>
                {Math.abs(subscriberChange)}
              </span>
              <span className="text-slate-400">this month</span>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Average Revenue</p>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${data.totalSubscribers > 0 ? (data.monthlyRevenue / data.totalSubscribers).toFixed(2) : "0.00"}
            </p>
            <p className="text-slate-400 text-sm">per subscriber</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <CreditCard className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${data.totalRevenue.toLocaleString()}
            </p>
            <p className="text-slate-400 text-sm">estimated 6 months</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revenue Trend</h2>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revenue by Tier</h2>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { tier: "T1", revenue: data.revenueByTier.T1 },
                  { tier: "T2", revenue: data.revenueByTier.T2 },
                  { tier: "T3", revenue: data.revenueByTier.T3 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="tier" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>

        {/* Subscribers by Tier */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tier 1</h3>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">T1</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{data.subscribersByTier.T1}</p>
            <p className="text-slate-400 text-sm">subscribers</p>
            <p className="text-green-400 text-sm mt-2">
              ${data.revenueByTier.T1.toLocaleString()}/month
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tier 2</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">T2</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{data.subscribersByTier.T2}</p>
            <p className="text-slate-400 text-sm">subscribers</p>
            <p className="text-green-400 text-sm mt-2">
              ${data.revenueByTier.T2.toLocaleString()}/month
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tier 3</h3>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">T3</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{data.subscribersByTier.T3}</p>
            <p className="text-slate-400 text-sm">subscribers</p>
            <p className="text-green-400 text-sm mt-2">
              ${data.revenueByTier.T3.toLocaleString()}/month
            </p>
          </Card>
        </div>

        {/* Recent Subscribers */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Subscribers</h2>
          {data.recentSubscribers.length > 0 ? (
            <div className="space-y-3">
              {data.recentSubscribers.map((subscriber) => (
                <div
                  key={subscriber._id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {subscriber.userId?.name || subscriber.userId?.email || "Unknown"}
                    </p>
                    <p className="text-slate-400 text-sm">{subscriber.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      subscriber.tier === "T1" ? "bg-blue-500/20 text-blue-400" :
                      subscriber.tier === "T2" ? "bg-purple-500/20 text-purple-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {subscriber.tier}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">No subscribers yet</p>
          )}
        </Card>
      </div>
    </div>
  )
}

