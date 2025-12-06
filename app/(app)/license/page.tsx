"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { toast } from "sonner"
import { Key, Check, AlertCircle } from "lucide-react"
import { validateLicenseKey } from "@/lib/validation"

export default function LicensePage() {
  const [licenseKey, setLicenseKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, updatePlan } = useAuthStore()

  const planInfo = {
    free: {
      name: "Free",
      quota: 10,
      features: ["Basic chat access", "Limited model options"],
    },
    classic: {
      name: "Classic",
      quota: 100,
      features: ["Extended quota", "More model options", "Priority support"],
    },
    pro: {
      name: "Pro",
      quota: null,
      features: [
        "Unlimited messages",
        "All models available",
        "Custom prompts",
      ],
    },
  }

  const handleVerifyLicense = async () => {
    const validation = validateLicenseKey(licenseKey)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/license/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "License verification failed")
      }

      const data = await response.json()

      // Update user plan
      if (data.newPlan) {
        updatePlan(data.newPlan)
      }

      setLicenseKey("")
      toast.success(`Upgraded to ${data.newPlan} plan!`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8" />
            <h1 className="text-3xl font-bold">License Management</h1>
          </div>
          <p className="text-muted-foreground">
            Verify your license key to upgrade your plan
          </p>
        </div>

        {/* Current Plan */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-2xl font-bold capitalize">{user.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Quota</p>
                    <p className="text-2xl font-bold">
                      {user.quotaLimit === null
                        ? "Unlimited"
                        : `${user.quotaUsed}/${user.quotaLimit}`}
                    </p>
                  </div>
                </div>

                {user.plan !== "pro" && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-600">
                      Upgrade to get more messages and features
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* License Key Input */}
        <Card>
          <CardHeader>
            <CardTitle>Verify License Key</CardTitle>
            <CardDescription>
              Enter your license key to upgrade your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license">License Key</Label>
                <Input
                  id="license"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleVerifyLicense}
                disabled={isLoading || !licenseKey.trim()}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify License"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Plan Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(planInfo) as Array<[string, any]>).map(
              ([key, plan]) => (
                <Card
                  key={key}
                  className={
                    user?.plan === key ? "border-primary border-2" : ""
                  }
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {user?.plan === key && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {plan.quota
                        ? `${plan.quota} messages/month`
                        : "Unlimited messages"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
