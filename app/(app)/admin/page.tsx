"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { Users, MessageSquare, HelpCircle, BarChart3, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface DashboardStats {
  totalUsers: number
  usersByPlan: {
    free: number
    classic: number
    pro: number
  }
  totalMessages: number
  openTickets: number
  maintenanceMode: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
  }: {
    title: string
    value: string | number
    description?: string
    icon: React.ReactNode
    trend?: number
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "+" : ""}{trend}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>

      {/* Maintenance Mode Alert */}
      {stats?.maintenanceMode && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Maintenance Mode Enabled</p>
              <p className="text-sm text-yellow-800">
                Only founder accounts can access the platform
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
          trend={12}
        />
        <StatCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
          trend={8}
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          icon={<HelpCircle className="w-4 h-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active"
          value="99.9%"
          description="System uptime"
          icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Plans Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Plan</CardTitle>
            <CardDescription>Breakdown of active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Free</p>
                <p className="text-2xl font-bold">{stats.usersByPlan.free}</p>
                <div className="w-full bg-secondary rounded-full h-1 mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        (stats.usersByPlan.free / stats.totalUsers) * 100 || 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classic</p>
                <p className="text-2xl font-bold">{stats.usersByPlan.classic}</p>
                <div className="w-full bg-secondary rounded-full h-1 mt-2">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${
                        (stats.usersByPlan.classic / stats.totalUsers) * 100 || 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pro</p>
                <p className="text-2xl font-bold">{stats.usersByPlan.pro}</p>
                <div className="w-full bg-secondary rounded-full h-1 mt-2">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${
                        (stats.usersByPlan.pro / stats.totalUsers) * 100 || 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
