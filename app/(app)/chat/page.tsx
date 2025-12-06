"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AnimatedLoadingDots } from "@/components/animated-loading-dots"
import { useChatStore } from "@/lib/stores/useChatStore"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { Copy, Send, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard, formatRelativeTime } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { user } = useAuthStore()
  const {
    conversations,
    currentConversation,
    addConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    setCurrentConversation,
  } = useChatStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !user || isLoading) return

    // Check quota
    if (user.quotaUsed >= user.quotaLimit) {
      toast.error(
        "You've reached your message limit. Please upgrade your plan."
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
        body: JSON.stringify({
          message: input.trim(),
          conversationId: currentConversation?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Update UI with response
      if (data.success) {
        setInput("")
        toast.success("Message sent successfully")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setShowNewChat(true)
  }

  const handleDeleteConversation = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/chat/delete/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      deleteConversation(deleteId)
      setDeleteId(null)
      toast.success("Conversation deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-80 border-r border-border bg-secondary/20">
        <div className="p-4">
          <Button onClick={handleNewChat} className="w-full" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet. Start a new chat!
            </p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors group",
                  currentConversation?.id === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
                onClick={() => setCurrentConversation(conv)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs opacity-70">
                      {formatRelativeTime(conv.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setDeleteId(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quota indicator */}
        {user && (
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Messages used</span>
                <span className="font-medium">
                  {user.quotaUsed}/{user.quotaLimit}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    user.quotaUsed >= user.quotaLimit
                      ? "bg-destructive"
                      : user.quotaUsed >= user.quotaLimit * 0.8
                        ? "bg-yellow-500"
                        : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (user.quotaUsed / user.quotaLimit) * 100
                    )}%`,
                  }}
                />
              </div>
              {user.quotaUsed >= user.quotaLimit && (
                <p className="text-xs text-destructive">Limit reached</p>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {currentConversation && (
          <div className="border-b border-border p-4">
            <h1 className="text-lg font-semibold">
              {currentConversation.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Model: {currentConversation.model}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-12 text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to VanIA Chat
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select a conversation or create a new one to get started.
                </p>
                <Button onClick={handleNewChat}>Start New Chat</Button>
              </Card>
            </div>
          ) : (
            <>
              {currentConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                currentConversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-2xl rounded-lg p-4",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="mt-2 flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-4">
                    <AnimatedLoadingDots size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {currentConversation && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
