"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  LogOut,
  Home,
  MessageSquare,
  HelpCircle,
  Settings,
  Key,
  History,
  BarChart3,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const isAdmin = user?.role === "admin" || user?.role === "founder"

  const menuItems: MenuItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Chat",
      href: "/chat",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: "Support",
      href: "/support",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      label: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: "License",
      href: "/license",
      icon: <Key className="w-5 h-5" />,
    },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            href: "/admin",
            icon: <BarChart3 className="w-5 h-5" />,
            adminOnly: true,
          },
        ]
      : []),
  ]

  const handleLogout = async () => {
    logout()
    setIsOpen(false)
    router.push("/auth/login")
  }

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r border-border shadow-lg overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="pt-20 px-6 pb-6 border-b border-border">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                VanIA
              </h2>
              {user && (
                <p className="text-sm text-muted-foreground mt-2">
                  {user.email}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-6 space-y-2 px-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
