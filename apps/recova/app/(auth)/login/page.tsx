"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"credentials" | "mfa">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setIsLoading(false)
    setStep("mfa")
  }

  async function handleMFA(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (otp.length < 6) {
      setError("Enter the 6-digit code from your authenticator app.")
      return
    }
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setIsLoading(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-[oklch(0.098_0_0)] p-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">RECOVA</span>
          <span className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
            PRODUCTION
          </span>
        </div>

        <div className="space-y-6">
          <blockquote className="space-y-3">
            <p className="text-white/90 text-2xl font-medium leading-relaxed">
              "Automated loan recovery, built for compliance and speed."
            </p>
            <footer className="text-white/40 text-sm">
              VFD Microfinance Bank — Debt Recovery Operations
            </footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Recovery Rate", value: "87.4%" },
              { label: "Active Mandates", value: "1,247" },
              { label: "Avg Resolution", value: "4.2d" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-white text-xl font-semibold">{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">
          © 2025 VFD Microfinance Bank. All rights reserved. Regulated by CBN.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">RECOVA</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {step === "credentials" ? "Welcome back" : "Two-factor authentication"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "credentials"
                ? "Sign in to the RECOVA recovery portal"
                : `Enter the code from your authenticator app for ${email}`}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@vfdbank.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMFA} className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  Open your authenticator app and enter the 6-digit verification code for RECOVA.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-10 text-center text-xl tracking-[0.5em] monospace-nums font-semibold"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? "Verifying…" : "Verify"}
              </Button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setOtp(""); setError("") }}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
