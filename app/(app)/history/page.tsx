"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { useChatStore } from "@/lib/stores/useChatStore"
import { formatRelativeTime } from "@/lib/utils"
import { Trash2, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function HistoryPage() {
  const { user } = useAuthStore()
  const { conversations, deleteConversation } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (conversationId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/delete/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      })

      if (response.ok) {
        deleteConversation(conversationId)
        toast.success("Conversation deleted")
      }
    } catch (error) {
      toast.error("Failed to delete conversation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Chat History</h1>
          </div>
          <p className="text-muted-foreground">
            All your conversations and chats
          </p>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
            <p className="text-muted-foreground">
              Start a new chat to see your history here
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{conv.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {conv.messages.length} messages • {formatRelativeTime(conv.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conv.id)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
