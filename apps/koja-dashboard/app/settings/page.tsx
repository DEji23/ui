"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Setting2, Notification, Bus, Money, SecurityUser, Save2,
  People, ShieldTick, Lock1, ProfileAdd, TickCircle, CloseCircle,
} from "iconsax-react"

const SECTIONS = [
  { id: "fleet", label: "Fleet", icon: Bus },
  { id: "dispatch", label: "Dispatch Rules", icon: Setting2 },
  { id: "compliance", label: "Compliance", icon: ShieldTick },
  { id: "team", label: "Team Members", icon: People },
  { id: "permissions", label: "Permissions", icon: Lock1 },
  { id: "reconciliation", label: "Reconciliation", icon: Money },
  { id: "notifications", label: "Notifications", icon: Notification },
  { id: "access", label: "Access & Security", icon: SecurityUser },
] as const

type Section = (typeof SECTIONS)[number]["id"]
type Toast = { id: number; message: string }

type TeamRole = "Admin" | "Fleet Manager" | "Dispatcher" | "Analyst"
type TeamStatus = "active" | "suspended"
interface TeamMember { id: string; name: string; email: string; role: TeamRole; status: TeamStatus }

const INITIAL_TEAM: TeamMember[] = [
  { id: "t1", name: "Adewale Okonkwo", email: "adewale@koja.ng", role: "Admin", status: "active" },
  { id: "t2", name: "Funmi Adeyemi", email: "funmi@koja.ng", role: "Fleet Manager", status: "active" },
  { id: "t3", name: "Chukwu Eze", email: "chukwu@koja.ng", role: "Dispatcher", status: "active" },
  { id: "t4", name: "Ngozi Okafor", email: "ngozi@koja.ng", role: "Analyst", status: "suspended" },
]

const MODULES = ["Dashboard", "Drivers", "Fleet", "Dispatch", "Alerts", "Reconciliation", "Leave", "Settings"] as const
const PERM_ROLES = ["Admin", "Fleet Manager", "Dispatcher", "Analyst"] as const
type Module = (typeof MODULES)[number]
type PermRole = (typeof PERM_ROLES)[number]

const DEFAULT_PERMS: Record<Module, Record<PermRole, boolean>> = {
  Dashboard:      { Admin: true,  "Fleet Manager": true,  Dispatcher: true,  Analyst: true },
  Drivers:        { Admin: true,  "Fleet Manager": true,  Dispatcher: true,  Analyst: false },
  Fleet:          { Admin: true,  "Fleet Manager": true,  Dispatcher: false, Analyst: true },
  Dispatch:       { Admin: true,  "Fleet Manager": true,  Dispatcher: true,  Analyst: false },
  Alerts:         { Admin: true,  "Fleet Manager": true,  Dispatcher: true,  Analyst: true },
  Reconciliation: { Admin: true,  "Fleet Manager": true,  Dispatcher: false, Analyst: true },
  Leave:          { Admin: true,  "Fleet Manager": true,  Dispatcher: true,  Analyst: false },
  Settings:       { Admin: true,  "Fleet Manager": false, Dispatcher: false, Analyst: false },
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("fleet")
  const [toasts, setToasts] = useState<Toast[]>([])

  // Fleet settings
  const [fleetName, setFleetName] = useState("Koja Lagos Fleet")
  const [timezone, setTimezone] = useState("Africa/Lagos")
  const [currency, setCurrency] = useState("NGN")

  // Dispatch settings
  const [autoPub, setAutoPub] = useState(false)
  const [noShowWindow, setNoShowWindow] = useState("30")
  const [replaceAlert, setReplaceAlert] = useState(true)

  // Compliance settings
  const [maxDailyHours, setMaxDailyHours] = useState("10")
  const [minRestHours, setMinRestHours] = useState("8")
  const [maxConsecDays, setMaxConsecDays] = useState("6")
  const [weeklyHourCap, setWeeklyHourCap] = useState("60")
  const [compAutoBlock, setCompAutoBlock] = useState(true)
  const [compAlerts, setCompAlerts] = useState(true)

  // Team members
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamRole>("Dispatcher")

  // Permissions
  const [perms, setPerms] = useState<Record<Module, Record<PermRole, boolean>>>(DEFAULT_PERMS)

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

  function handleSave() { addToast("Settings saved") }

  function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    const newMember: TeamMember = {
      id: `t${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "active",
    }
    setTeam((t) => [...t, newMember])
    addToast(`Invite sent to ${inviteEmail}`)
    setInviteOpen(false)
    setInviteName(""); setInviteEmail(""); setInviteRole("Dispatcher")
  }

  function toggleMember(id: string) {
    setTeam((t) => t.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "suspended" : "active" } : m))
  }

  function togglePerm(module: Module, role: PermRole) {
    if (role === "Admin") return // Admin always has full access
    setPerms((p) => ({
      ...p,
      [module]: { ...p[module], [role]: !p[module][role] },
    }))
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
          <div className="w-52 shrink-0">
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
                  <s.icon size={16} color="currentColor" variant={section === s.id ? "Bold" : "Linear"} />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">

            {/* ── Fleet ── */}
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
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Dispatch ── */}
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
                    <p className="text-[11px] text-zinc-600 mb-2">Flag a driver as no-show if they haven&apos;t accepted their shift within this time</p>
                    <Input type="number" value={noShowWindow} onChange={(e) => setNoShowWindow(e.target.value)} className="max-w-[120px]" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Compliance Rules ── */}
            {section === "compliance" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Compliance Rules</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Max daily driving hours</label>
                      <p className="text-[11px] text-zinc-600 mb-2">Driver is flagged if they exceed this per day</p>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="24" value={maxDailyHours} onChange={(e) => setMaxDailyHours(e.target.value)} className="max-w-[100px]" />
                        <span className="text-xs text-zinc-500">hours</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Minimum rest between shifts</label>
                      <p className="text-[11px] text-zinc-600 mb-2">Required rest before a driver can start again</p>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="24" value={minRestHours} onChange={(e) => setMinRestHours(e.target.value)} className="max-w-[100px]" />
                        <span className="text-xs text-zinc-500">hours</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Max consecutive working days</label>
                      <p className="text-[11px] text-zinc-600 mb-2">Driver must take a day off after this many days</p>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="14" value={maxConsecDays} onChange={(e) => setMaxConsecDays(e.target.value)} className="max-w-[100px]" />
                        <span className="text-xs text-zinc-500">days</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Weekly hour cap</label>
                      <p className="text-[11px] text-zinc-600 mb-2">Maximum total hours a driver may work per week</p>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="80" value={weeklyHourCap} onChange={(e) => setWeeklyHourCap(e.target.value)} className="max-w-[100px]" />
                        <span className="text-xs text-zinc-500">hours</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <Toggle
                    label="Auto-block on compliance breach"
                    description="Automatically block a driver from accepting shifts if they exceed limits"
                    checked={compAutoBlock}
                    onChange={setCompAutoBlock}
                  />
                  <Separator />
                  <Toggle
                    label="Compliance breach alerts"
                    description="Send notification when a driver approaches or exceeds compliance limits"
                    checked={compAlerts}
                    onChange={setCompAlerts}
                  />
                  <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/20 p-4 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldTick size={14} color="#f59e0b" variant="Bold" />
                      <p className="text-xs font-semibold text-amber-400">Current limits summary</p>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Drivers may work up to <span className="text-zinc-300 font-medium">{maxDailyHours}h/day</span>, with at least <span className="text-zinc-300 font-medium">{minRestHours}h rest</span> between shifts, no more than <span className="text-zinc-300 font-medium">{maxConsecDays} consecutive days</span>, capped at <span className="text-zinc-300 font-medium">{weeklyHourCap}h/week</span>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Team Members ── */}
            {section === "team" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Team Members</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{team.filter(m => m.status === "active").length} active · {team.filter(m => m.status === "suspended").length} suspended</p>
                  </div>
                  <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                    <ProfileAdd size={14} color="currentColor" />
                    Invite Member
                  </Button>
                </div>
                <Card>
                  <div className="divide-y divide-white/[0.04]">
                    {team.map((m) => (
                      <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                        <Avatar name={m.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200">{m.name}</p>
                            <Badge variant={m.status === "active" ? "success" : "muted"}>
                              {m.status === "active" ? "Active" : "Suspended"}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{m.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border",
                            m.role === "Admin" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            m.role === "Fleet Manager" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            m.role === "Dispatcher" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}>
                            {m.role}
                          </span>
                          {m.id !== "t1" && (
                            <Button
                              variant={m.status === "active" ? "outline" : "success"}
                              size="sm"
                              onClick={() => {
                                toggleMember(m.id)
                                addToast(m.status === "active" ? `${m.name} suspended` : `${m.name} restored`)
                              }}
                            >
                              {m.status === "active" ? "Suspend" : "Restore"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Roles & Permissions ── */}
            {section === "permissions" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <CardTitle>Roles &amp; Permissions</CardTitle>
                    <p className="text-[11px] text-zinc-600">Admin always has full access</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          <th className="text-left px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-44">Module</th>
                          {PERM_ROLES.map((r) => (
                            <th key={r} className="px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                              <span className={cn(
                                "inline-block rounded-full px-2.5 py-1 border",
                                r === "Admin" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                r === "Fleet Manager" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                                r === "Dispatcher" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                "text-purple-400 bg-purple-500/10 border-purple-500/20"
                              )}>
                                {r}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {MODULES.map((mod) => (
                          <tr key={mod} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3.5 text-sm text-zinc-300 font-medium">{mod}</td>
                            {PERM_ROLES.map((role) => {
                              const allowed = perms[mod][role]
                              const isAdmin = role === "Admin"
                              return (
                                <td key={role} className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={() => togglePerm(mod, role)}
                                    disabled={isAdmin}
                                    className={cn(
                                      "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors mx-auto",
                                      allowed
                                        ? "bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25"
                                        : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06]",
                                      isAdmin && "cursor-default"
                                    )}
                                  >
                                    {allowed
                                      ? <TickCircle size={13} color="#34d399" variant="Bold" />
                                      : <CloseCircle size={13} color="#52525b" variant="Bold" />
                                    }
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Reconciliation ── */}
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

            {/* ── Notifications ── */}
            {section === "notifications" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <Toggle label="Critical alerts" description="Breakdowns, code red, inspection fails" checked={alertCritical} onChange={setAlertCritical} />
                  <Separator />
                  <Toggle label="Late start alerts" description="Driver hasn't accepted shift within window" checked={alertLate} onChange={setAlertLate} />
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

            {/* ── Access & Security ── */}
            {section === "access" && (
              <Card>
                <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
                  <CardTitle>Access &amp; Security</CardTitle>
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

            {section !== "team" && section !== "permissions" && (
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-1.5">
                  <Save2 size={14} color="currentColor" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite member dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        description="They'll receive an email with a link to set up their account."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Full Name</label>
            <Input placeholder="e.g. Amaka Nwosu" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Email Address</label>
            <Input type="email" placeholder="e.g. amaka@koja.ng" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Role</label>
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)}>
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button size="sm" className="gap-1.5" onClick={handleInvite} disabled={!inviteName.trim() || !inviteEmail.trim()}>
              <ProfileAdd size={14} color="currentColor" />
              Send Invite
            </Button>
          </div>
        </div>
      </Dialog>

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
