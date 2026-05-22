"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Setting2, Notification, Bus, Money, SecurityUser, Save2 } from "iconsax-react"

const SECTIONS = [
  { id: "fleet", label: "Fleet", icon: Bus },
  { id: "dispatch", label: "Dispatch Rules", icon: Setting2 },
  { id: "reconciliation", label: "Reconciliation", icon: Money },
  { id: "notifications", label: "Notifications", icon: Notification },
  { id: "access", label: "Access & Security", icon: SecurityUser },
] as const

type Section = (typeof SECTIONS)[number]["id"]
type Toast = { id: number; message: string }

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("fleet")
  const [toasts, setToasts] = useState<Toast[]>([])

  // Fleet settings
  const [fleetName, setFleetName] = useState("Koja Lagos Fleet")
  const [timezone, setTimezone] = useState("Africa/Lagos")
  const [currency, setCurrency] = useState("NGN")
  const [maxHours, setMaxHours] = useState("60")

  // Dispatch settings
  const [autoPub, setAutoPub] = useState(false)
  const [noShowWindow, setNoShowWindow] = useState("30")
  const [replaceAlert, setReplaceAlert] = useState(true)

  // Reconciliation settings
  const [discThreshold, setDiscThreshold] = useState("5000")
  const [autoFlag, setAutoFlag] = useState(true)
  const [promptDelay, setPromptDelay] = useState("60")

  // Notification settings
  const [alertCritical, setAlertCritical] = useState(true)
  const [alertLate, setAlertLate] = useState(true)
  const [alertCash, setAlertCash] = useState(true)
  const [alertLeave, setAlertLeave] = useState(false)
  const [emailDigest, setEmailDigest] = useState("daily")

  function addToast(message: string) {
    const id = Date.now()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }

  function handleSave() {
    addToast("Settings saved")
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Fleet configuration and preferences"
        action={
          <Button size="sm" className="gap-1.5 mr-1" onClick={handleSave}>
            <Save2 size={14} color="currentColor" />
            Save Changes
          </Button>
        }
      />
      <main className="flex-1 p-6">
        <div className="flex gap-6 max-w-5xl">
          {/* Sidebar nav */}
          <div className="w-44 shrink-0">
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    section === s.id
                      ? "bg-amber-500/10 text-amber-400 font-medium"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  )}
                >
                  <s.icon
                    size={16}
                    color="currentColor"
                    variant={section === s.id ? "Bold" : "Linear"}
                  />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">
            {section === "fleet" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Fleet Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Fleet Name</label>
                      <Input value={fleetName} onChange={(e) => setFleetName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Timezone</label>
                      <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="UTC">UTC</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Currency</label>
                      <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="NGN">NGN — Nigerian Naira</option>
                        <option value="USD">USD — US Dollar</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Max weekly hours per driver</label>
                      <Input type="number" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {section === "dispatch" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Dispatch Rules</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <Toggle
                    label="Auto-publish assignments"
                    description="Automatically publish the daily dispatch plan at 05:30"
                    checked={autoPub}
                    onChange={setAutoPub}
                  />
                  <Separator />
                  <Toggle
                    label="Alert on replacement needed"
                    description="Send notification when a driver is a no-show and replacement is required"
                    checked={replaceAlert}
                    onChange={setReplaceAlert}
                  />
                  <Separator />
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">No-show window (minutes)</label>
                    <p className="text-[11px] text-zinc-600 mb-2">Flag a driver as no-show if they haven’t accepted their shift within this time</p>
                    <Input type="number" value={noShowWindow} onChange={(e) => setNoShowWindow(e.target.value)} className="max-w-[120px]" />
                  </div>
                </CardContent>
              </Card>
            )}

            {section === "reconciliation" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Reconciliation Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Discrepancy threshold (₦)</label>
                    <p className="text-[11px] text-zinc-600 mb-2">Declarations within this amount are auto-matched</p>
                    <Input type="number" value={discThreshold} onChange={(e) => setDiscThreshold(e.target.value)} className="max-w-[160px]" />
                  </div>
                  <Separator />
                  <Toggle
                    label="Auto-flag large discrepancies"
                    description="Automatically flag discrepancies above the threshold for investigation"
                    checked={autoFlag}
                    onChange={setAutoFlag}
                  />
                  <Separator />
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Prompt delay (minutes after shift end)</label>
                    <Input type="number" value={promptDelay} onChange={(e) => setPromptDelay(e.target.value)} className="max-w-[120px]" />
                  </div>
                </CardContent>
              </Card>
            )}

            {section === "notifications" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <Toggle label="Critical alerts" description="Breakdowns, code red, inspection fails" checked={alertCritical} onChange={setAlertCritical} />
                  <Separator />
                  <Toggle label="Late start alerts" description="Driver hasn’t accepted shift within window" checked={alertLate} onChange={setAlertLate} />
                  <Separator />
                  <Toggle label="Cash discrepancy alerts" description="End-of-shift declaration mismatches" checked={alertCash} onChange={setAlertCash} />
                  <Separator />
                  <Toggle label="Leave request alerts" description="New leave requests submitted by drivers" checked={alertLeave} onChange={setAlertLeave} />
                  <Separator />
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Email digest</label>
                    <Select value={emailDigest} onChange={(e) => setEmailDigest(e.target.value)} className="max-w-[200px]">
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly summary</option>
                      <option value="daily">Daily digest</option>
                      <option value="none">Disabled</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {section === "access" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Access & Security</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Fleet Manager Name</label>
                      <Input defaultValue="Adewale Okonkwo" />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
                      <Input type="email" defaultValue="adewale@koja.ng" />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-zinc-200 mb-1">Change Password</p>
                    <p className="text-xs text-zinc-500 mb-3">Leave blank to keep current password</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">New Password</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">Confirm Password</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-zinc-200 mb-1">Session</p>
                    <Button variant="destructive" size="sm">Sign Out of All Devices</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} className="gap-1.5">
                <Save2 size={14} color="currentColor" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="px-4 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-amber-500" : "bg-white/10"
        )}
      >
        <span className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-1"
        )} />
      </button>
    </div>
  )
}
