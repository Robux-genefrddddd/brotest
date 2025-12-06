"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              VanIA
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Complete AI Platform
            </p>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 14, Firebase, and OpenRouter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
            <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">🔐 Secure</h3>
              <p className="text-sm text-muted-foreground">
                Firebase Auth + Firestore with strict security rules
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">🚀 Modular</h3>
              <p className="text-sm text-muted-foreground">
                Clean architecture ready for VanIA implementation
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">⚡ Ready</h3>
              <p className="text-sm text-muted-foreground">
                Integrated with OpenRouter for AI features
              </p>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <Button asChild>
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
