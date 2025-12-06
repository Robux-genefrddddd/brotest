# VanIA Quick Reference Guide

Quick lookup for common development tasks.

## 🔐 Security Functions

### Sanitize Input
```typescript
import { sanitizeInput, sanitizeMessage, sanitizeEmail } from "@/lib/sanitize"

// Sanitize general input
const safe = sanitizeInput(userInput)

// Sanitize chat message (allows newlines)
const safeMsg = sanitizeMessage(userMessage)

// Sanitize and validate email
const email = sanitizeEmail(userEmail)
```

### Validate Input
```typescript
import {
  validateEmail,
  validatePassword,
  validateMessage,
  validateLicenseKey,
  validateUsername,
} from "@/lib/validation"

const emailVal = validateEmail("user@example.com")
if (!emailVal.valid) console.error(emailVal.error)
```

### API Security
```typescript
import { createApiResponse, logSecurityEvent } from "@/lib/security"

// Create secure response
const response = createApiResponse(true, { data }, null)

// Log security event
logSecurityEvent({
  eventType: "USER_ACTION",
  userId: user.id,
  ipAddress: request.headers.get("x-forwarded-for"),
  details: { action: "description" },
  severity: "low",
})
```

## 🎨 Component Usage

### Loading Spinner
```typescript
import { LoadingSpinner } from "@/components/loading-spinner"

<LoadingSpinner size="md" />
```

### Animated Loading Dots
```typescript
import { AnimatedLoadingDots } from "@/components/animated-loading-dots"

<AnimatedLoadingDots size="sm" />
```

### shadcn Components
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"

<Button variant="default" size="lg">Click me</Button>
<Input type="email" placeholder="Email" />
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

## 📦 State Management

### Auth Store
```typescript
import { useAuthStore } from "@/lib/stores/useAuthStore"

const { user, setUser, logout, updatePlan } = useAuthStore()

// Check if user exists
if (!user) router.push("/auth/login")

// Update plan
updatePlan("pro")

// Logout
logout()
```

### Chat Store
```typescript
import { useChatStore } from "@/lib/stores/useChatStore"

const {
  conversations,
  currentConversation,
  addConversation,
  addMessage,
  deleteConversation,
} = useChatStore()
```

## 🔌 API Calls

### With Authentication
```typescript
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
  },
  body: JSON.stringify({ data }),
})

const data = await response.json()
if (!response.ok) throw new Error(data.error)
```

### OpenRouter AI
```typescript
import { sendChatMessage, sendSupportMessage } from "@/lib/openrouter"

const response = await sendChatMessage([
  { role: "user", content: "Hello" }
])

const assistantMessage = response.choices[0].message.content
```

## 🎯 Patterns

### Create API Route
```typescript
// app/api/endpoint/route.ts
import { NextRequest, NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/sanitize"
import { validateInput } from "@/lib/validation"
import { createApiResponse } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        createApiResponse(false, undefined, "Unauthorized"),
        { status: 401 }
      )
    }

    // Parse and validate
    const body = await request.json()
    const validation = validateInput(body.field)
    if (!validation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, validation.error),
        { status: 400 }
      )
    }

    const sanitized = sanitizeInput(body.field)

    // Perform action
    const result = await doSomething(sanitized)

    return NextResponse.json(
      createApiResponse(true, result),
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      createApiResponse(false, undefined, "Server error"),
      { status: 500 }
    )
  }
}
```

### Create Page Component
```typescript
// app/(app)/page/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  // Protect route
  useEffect(() => {
    if (!user) router.push("/auth/login")
  }, [user, router])

  if (!user) return null

  const handleAction = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) throw new Error("Action failed")
      const data = await response.json()

      toast.success("Success!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      {isLoading && <LoadingSpinner />}
      {!isLoading && (
        <Card>
          <Button onClick={handleAction}>Action</Button>
        </Card>
      )}
    </div>
  )
}
```

## 🗄️ Firestore Operations

### Save User
```typescript
// In Firestore collection 'users'
{
  id: user.uid,
  email: user.email,
  name: "User Name",
  role: "user",
  plan: "free",
  status: "active",
  quotaUsed: 0,
  quotaLimit: 10,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

### Save Conversation
```typescript
// In Firestore collection 'conversations'
{
  id: uuid(),
  userId: user.uid,
  title: "New Chat",
  model: "gpt-3.5-turbo",
  archived: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

### Query User Conversations
```typescript
const q = query(
  collection(firestore, "conversations"),
  where("userId", "==", user.uid),
  orderBy("updatedAt", "desc")
)

const snapshot = await getDocs(q)
const conversations = snapshot.docs.map(doc => doc.data())
```

## 🎨 Tailwind Classes

### Common Classes
```html
<!-- Spacing -->
<div class="p-4 m-2 gap-4 space-y-2">

<!-- Sizing -->
<div class="w-full h-screen max-w-2xl">

<!-- Text -->
<div class="text-lg font-semibold text-primary text-center">

<!-- Colors -->
<div class="bg-primary text-primary-foreground">
<div class="border border-border bg-card">

<!-- Responsive -->
<div class="md:p-6 lg:w-1/2 grid grid-cols-1 md:grid-cols-2">

<!-- Animations -->
<div class="transition-colors hover:bg-secondary animate-spin">
```

## 🔗 Links

- User dashboard: `/`
- Chat: `/chat`
- Support: `/support`
- Settings: `/settings`
- History: `/history`
- License: `/license`
- Admin: `/admin`
- Login: `/auth/login`
- Register: `/auth/register`

## 📝 Toast Notifications
```typescript
import { toast } from "sonner"

toast.success("Success!")
toast.error("Error occurred")
toast.loading("Loading...")
toast.promise(promise, {
  loading: "Loading...",
  success: "Done!",
  error: "Failed",
})
```

## 🔄 Common Task: Add New Page

1. Create folder: `app/(app)/newpage/`
2. Create `page.tsx` with "use client" directive
3. Add authentication check
4. Use Zustand stores for state
5. Add route to sidebar (if needed)
6. Test navigation

## 🔐 Common Task: Add Protected API

1. Create `app/api/route/route.ts`
2. Verify auth header
3. Sanitize all inputs
4. Validate all fields
5. Check permissions/quotas
6. Log security event
7. Return typed response

## 🎯 Common Task: Add New Component

1. Create in `components/`
2. Make it `"use client"` if needed
3. Add TypeScript types
4. Use shadcn/ui as base
5. Add Framer Motion for animations
6. Use `cn()` for Tailwind classes

## 💡 Debug Tips

```typescript
// Log in console
console.error("Debug message", data)

// Check auth
console.log(useAuthStore.getState().user)

// Check chat state
console.log(useChatStore.getState().conversations)

// Network request
fetch("/api/test")
  .then(r => r.json())
  .then(d => console.log(d))
```

## 📊 Check User Plan Quotas

```typescript
const { user } = useAuthStore()

if (user.quotaUsed >= user.quotaLimit) {
  // Show upgrade message
  toast.error("Quota reached. Upgrade to continue.")
}

const percentUsed = (user.quotaUsed / user.quotaLimit) * 100
```

## 🔐 Check Admin Access

```typescript
const { user } = useAuthStore()

const isAdmin = user?.role === "admin" || user?.role === "founder"
const isFounder = user?.role === "founder"

if (!isAdmin) {
  router.push("/chat")
}
```

---

**Tip**: Keep this file open while developing!
