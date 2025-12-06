/**
 * Core application types
 */

export type UserRole = "founder" | "admin" | "support" | "user"

export type UserPlan = "free" | "classic" | "pro"

export type LicenseStatus = "active" | "used" | "revoked"

export type TicketStatus = "open" | "in_review" | "closed"

export type Priority = "low" | "medium" | "high" | "urgent"

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: UserRole
  plan: UserPlan
  status: "active" | "banned" | "suspended"
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  quotaUsed: number
  quotaLimit: number
}

export interface Conversation {
  id: string
  userId: string
  title: string
  model: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  archived: boolean
}

export interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  model?: string
  tokens?: number
  createdAt: Date
}

export interface SupportTicket {
  id: string
  userId: string
  messages: TicketMessage[]
  status: TicketStatus
  priority: Priority
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  handledByAdmin?: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  isAdmin: boolean
  content: string
  createdAt: Date
}

export interface License {
  id: string
  key: string
  planTarget: UserPlan
  status: LicenseStatus
  usageLimit: number
  usageCount: number
  createdAt: Date
  createdBy: string
  usedAt?: Date
  usedBy?: string
  revokedAt?: Date
  revokedBy?: string
}

export interface AdminSettings {
  id: string
  maintenanceMode: boolean
  maintenanceMessage: string
  globalAIPrompt: string
  supportAIPrompt: string
  activeModels: string[]
  updatedAt: Date
  updatedBy: string
}

export interface ActionLog {
  id: string
  userId: string
  action: string
  resource: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
