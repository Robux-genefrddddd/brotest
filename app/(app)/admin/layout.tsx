"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  Key,
  HelpCircle,
  Settings,
  AlertCircle,
} from "lucide-react"

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Licenses",
    href: "/admin/licenses",
    icon: Key,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: HelpCircle,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    founderOnly: true,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "founder")) {
      router.push("/chat")
    }
  }, [user, router])

  if (!user || (user.role !== "admin" && user.role !== "founder")) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-secondary/20 overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Admin Panel
          </h2>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            Role: {user.role}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {adminMenuItems
            .filter((item) => !item.founderOnly || user.role === "founder")
            .map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
                    item.href === "/admin"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
