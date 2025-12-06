"use client"

import { create } from "zustand"
import { User, UserPlan, UserRole } from "@/types"

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  updatePlan: (plan: UserPlan) => void
  updateQuota: (used: number, limit: number) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => set({ user: null, error: null }),

  updatePlan: (plan) =>
    set((state) => ({
      user: state.user ? { ...state.user, plan } : null,
    })),

  updateQuota: (used, limit) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, quotaUsed: used, quotaLimit: limit }
        : null,
    })),
}))
