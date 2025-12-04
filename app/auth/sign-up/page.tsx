"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { MapPin, AlertCircle, Shield, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUpAction } from "@/app/actions/auth"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [accountType, setAccountType] = useState<"salesperson" | "owner">("salesperson")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null)
  const [checkingFirstUser, setCheckingFirstUser] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const res = await fetch("/api/auth/check-first-user")
        if (!res.ok) {
          // If API fails, default to showing as first user
          console.error("[v0] API response not OK:", res.status)
          setIsFirstUser(true)
          return
        }
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setIsFirstUser(data.isFirstUser)
        } catch (parseError) {
          console.error("[v0] JSON parse error:", parseError, "Response:", text)
          setIsFirstUser(true)
        }
      } catch (err) {
        console.error("[v0] Fetch error:", err)
        setIsFirstUser(true)
      } finally {
        setCheckingFirstUser(false)
      }
    }
    checkFirstUser()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("fullName", fullName)
      formData.append("role", isFirstUser ? "owner" : accountType)

      const result = await signUpAction(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.redirect) {
        router.push(result.redirect)
      } else if (result.pendingApproval) {
        router.push("/auth/pending-approval")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingFirstUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">TravelQuote Pro</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
            <CardDescription>
              {isFirstUser ? "Create the primary admin account" : "Register as salesperson"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFirstUser && (
              <Alert className="mb-4 bg-emerald-50 border-emerald-200">
                <Shield className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800 text-xs sm:text-sm">
                  You are the first user! Your account will be the Primary Admin with full access.
                </AlertDescription>
              </Alert>
            )}

            {!isFirstUser && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs sm:text-sm">
                  After registration, the admin will review and approve your account.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeatPassword">Confirm Password</Label>
                  <Input
                    id="repeatPassword"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : isFirstUser ? "Create Admin Account" : "Register"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
