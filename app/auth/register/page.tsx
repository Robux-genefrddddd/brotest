"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { toast } from "sonner"
import { sanitizeEmail } from "@/lib/sanitize"
import { validateEmail, validatePassword, validateUsername } from "@/lib/validation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      toast.error(usernameValidation.error)
      return
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      toast.error(emailValidation.error)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.error)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setIsLoading(true)
    setLoading(true)

    try {
      const sanitizedEmail = sanitizeEmail(email)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: sanitizedEmail,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      const data = await response.json()

      // Store token
      if (data.token) {
        localStorage.setItem("firebaseToken", data.token)
      }

      // Set user
      setUser(data.user)
      toast.success("Account created successfully!")
      router.push("/chat")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
              VanIA
            </h1>
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join VanIA and start using AI today</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
