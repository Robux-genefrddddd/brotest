"use client"

import { create } from "zustand"
import { Conversation, Message } from "@/types"

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  isLoading: boolean
  error: string | null

  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (conversationId: string, message: Partial<Message>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useChatStore = create<ChatState>(set => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,

  setConversations: conversations => set({ conversations }),

  setCurrentConversation: conversation =>
    set({ currentConversation: conversation }),

  addConversation: conversation =>
    set(state => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation,
    })),

  updateConversation: (id, updates) =>
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentConversation:
        state.currentConversation?.id === id
          ? { ...state.currentConversation, ...updates }
          : state.currentConversation,
    })),

  deleteConversation: id =>
    set(state => ({
      conversations: state.conversations.filter(c => c.id !== id),
      currentConversation:
        state.currentConversation?.id === id ? null : state.currentConversation,
    })),

  addMessage: message =>
    set(state => {
      if (!state.currentConversation) return state

      return {
        currentConversation: {
          ...state.currentConversation,
          messages: [...state.currentConversation.messages, message],
          updatedAt: new Date(),
        },
      }
    }),

  updateLastMessage: (conversationId, updates) =>
    set(state => {
      if (state.currentConversation?.id !== conversationId) return state

      const messages = [...state.currentConversation.messages]
      const lastIndex = messages.length - 1

      if (lastIndex >= 0) {
        messages[lastIndex] = { ...messages[lastIndex], ...updates }
      }

      return {
        currentConversation: {
          ...state.currentConversation,
          messages,
          updatedAt: new Date(),
        },
      }
    }),

  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  clear: () =>
    set({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      error: null,
    }),
}))
