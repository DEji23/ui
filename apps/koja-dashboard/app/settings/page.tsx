"use client"
import { useState, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { teamMembers as initialTeam, type TeamMember } from "@/lib/data"
import { cn, formatDate } from "@/lib/utils"

type Section = "company" | "team" | "roles" | "compliance" | "notifications" | "access"

const sections: { id: Section; label: string }[] = [
  { id: "company", label: "Company Profile" },
  { id: "team", label: "Team Members" },
  { id: "roles", label: "Roles & Permissions" },
  { id: "compliance", label: "Compliance Rules" },
  { id: "notifications", label: "Notifications" },
  { id: "access", label: "Account & Access" },
]

const roleBadge: Record<string, "green" | "amber" | "blue" | "gray" | "yellow"> = {
  owner: "amber", fleet_manager: "green", scheduler: "blue", dispatcher: "blue", finance: "yellow", auditor: "gray",
}

const roleLabels: Record<string, string> = {
  owner: "Owner", fleet_manager: "Fleet Manager", scheduler: "Scheduler",
  dispatcher: "Dispatcher", finance: "Finance Officer", auditor: "Auditor",
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", on ? "bg-amber-500" : "bg-white/15")}
    >
      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all", on ? "left-5" : "left-1")} />
    </button>
  )
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("company")
  const [team, setTeam] = useState<TeamMember[]>(initialTeam)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("dispatcher")
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  // Company settings
  const [fleetName, setFleetName] = useState("KOJA Fleet Services")
  const [timezone, setTimezone] = useState("Africa/Lagos")
  const [currency, setCurrency] = useState("NGN")
  const [maxHours, setMaxHours] = useState("10")

  // Compliance rules
  const [maxDailyHours, setMaxDailyHours] = useState("10")
  const [minRest, setMinRest] = useState("8")
  const [maxConsecutive, setMaxConsecutive] = useState("6")
  const [weeklyHours, setWeeklyHours] = useState("60")

  // Notifications
  const [notifAlerts, setNotifAlerts] = useState(true)
  const [notifLeave, setNotifLeave] = useState(true)
  const [notifDispatch, setNotifDispatch] = useState(true)
  const [notifReconciliation, setNotifReconciliation] = useState(false)
  const [emailDigest, setEmailDigest] = useState("daily")

  // Dispatch
  const [autoPublish, setAutoPublish] = useState(false)
  const [noShowWindow, setNoShowWindow] = useState("30")
  const [replaceAlert, setReplaceAlert] = useState(true)

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const handleInvite = () => {
    if (!inviteName || !inviteEmail) return
    const newMember: TeamMember = {
      id: `USR-${String(team.length + 1).padStart(3, "0")}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole as TeamMember["role"],
      status: "active",
      lastLogin: "Never",
      depot: "All Depots",
    }
    setTeam((t) => [...t, newMember])
    toast(`Invitation sent to ${inviteEmail}`)
    setInviteOpen(false)
    setInviteName(""); setInviteEmail(""); setInviteRole("dispatcher")
  }

  const handleSuspendMember = (id: string) => {
    setTeam((t) => t.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "suspended" : "active" } : m))
    toast("Member status updated", "info")
  }

  return (
    <div className="pt-14">
      <Header title="Settings" />

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Left sidebar */}
        <div className="w-52 border-r border-white/6 py-5 px-3 shrink-0">
          <div className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium",
                  section === s.id ? "bg-amber-500/12 text-amber-400" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 max-w-2xl">
          {section === "company" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Company Profile</h2>
                <p className="text-sm text-white/40">Update your company information and operational settings.</p>
              </div>
              <div className="space-y-4">
                <Input label="Fleet Name" value={fleetName} onChange={(e) => setFleetName(e.target.value)} />
                <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                  <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
                </Select>
                <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                </Select>
                <div className="space-y-3 pt-4 border-t border-white/8">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Dispatch Settings</p>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm text-white/80">Auto-publish dispatch plan</div>
                      <div className="text-xs text-white/40">Automatically publish at midnight</div>
                    </div>
                    <Toggle on={autoPublish} onChange={setAutoPublish} />
                  </div>
                  <Input label="No-show window (minutes)" type="number" value={noShowWindow} onChange={(e) => setNoShowWindow(e.target.value)} hint="Minutes after departure before no-show alert" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm text-white/80">Replace alert on no-show</div>
                      <div className="text-xs text-white/40">Trigger replacement notification</div>
                    </div>
                    <Toggle on={replaceAlert} onChange={setReplaceAlert} />
                  </div>
                </div>
              </div>
              <Button variant="primary" onClick={() => toast("Company settings saved")}>Save Changes</Button>
            </div>
          )}

          {section === "team" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white mb-1">Team Members</h2>
                  <p className="text-sm text-white/40">{team.length} members · {team.filter((m) => m.status === "active").length} active</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>+ Invite Member</Button>
              </div>
              <div className="space-y-2">
                {team.map((member) => (
                  <div key={member.id} className="bg-[#141518] border border-white/6 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-white/50 text-sm font-bold shrink-0">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/90">{member.name}</div>
                      <div className="text-xs text-white/40">{member.email}</div>
                    </div>
                    <Badge variant={roleBadge[member.role]} className="text-[9px] shrink-0">{roleLabels[member.role]}</Badge>
                    <Badge variant={member.status === "active" ? "green" : "red"} className="text-[9px] shrink-0">{member.status}</Badge>
                    <button
                      onClick={() => handleSuspendMember(member.id)}
                      className="text-xs text-white/30 hover:text-white/70 transition-colors ml-1"
                    >
                      {member.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "roles" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Roles & Permissions</h2>
                <p className="text-sm text-white/40">Configure what each role can access and modify.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left py-2 text-xs text-white/30 font-medium w-32">Module</th>
                      {["Owner", "Mgr", "Scheduler", "Dispatcher", "Finance", "Auditor"].map((r) => (
                        <th key={r} className="text-center py-2 text-xs text-white/30 font-medium px-2">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["Dashboard", "Drivers", "Fleet", "Dispatch", "Alerts", "Reconciliation", "Leave", "Settings"].map((mod) => (
                      <tr key={mod} className="border-b border-white/5 hover:bg-white/2">
                        <td className="py-2.5 text-white/70">{mod}</td>
                        {[
                          "Full", "Full", mod === "Dispatch" ? "View" : "Full", mod === "Settings" ? "None" : "Full",
                          mod === "Reconciliation" || mod === "Dashboard" ? "View" : "None",
                          "View",
                        ].map((perm, i) => (
                          <td key={i} className="text-center py-2.5 px-2">
                            <span className={cn("text-[10px] font-medium", perm === "Full" ? "text-amber-400" : perm === "View" ? "text-blue-400" : "text-white/20")}>
                              {perm}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="secondary" size="sm" onClick={() => toast("Permission changes saved")}>Save Permissions</Button>
            </div>
          )}

          {section === "compliance" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Compliance Rules</h2>
                <p className="text-sm text-white/40">These rules are enforced at roster creation and dispatch.</p>
              </div>
              <div className="space-y-4">
                <Input label="Max Daily Hours" type="number" value={maxDailyHours} onChange={(e) => setMaxDailyHours(e.target.value)} hint="Maximum hours a driver can work per day (default: 10h)" />
                <Input label="Minimum Rest Period (hours)" type="number" value={minRest} onChange={(e) => setMinRest(e.target.value)} hint="Minimum rest between shifts (default: 8h)" />
                <Input label="Max Consecutive Days" type="number" value={maxConsecutive} onChange={(e) => setMaxConsecutive(e.target.value)} hint="Maximum days without a day off (default: 6)" />
                <Input label="Weekly Hour Cap" type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} hint="Maximum hours per week (default: 60h)" />
              </div>
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3 text-xs text-amber-300">
                Changes apply to all future scheduling and dispatch immediately on save. Existing schedules are not retroactively affected.
              </div>
              <Button variant="primary" onClick={() => toast("Compliance rules updated")}>Save Rules</Button>
            </div>
          )}

          {section === "notifications" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Notifications</h2>
                <p className="text-sm text-white/40">Choose which events trigger in-app notifications.</p>
              </div>
              <div className="space-y-1">
                {[
                  { label: "Critical Alerts", desc: "Breakdowns, no-shows, emergencies", on: notifAlerts, set: setNotifAlerts },
                  { label: "Leave Requests", desc: "New leave requests from drivers", on: notifLeave, set: setNotifLeave },
                  { label: "Dispatch Events", desc: "Duty status changes and updates", on: notifDispatch, set: setNotifDispatch },
                  { label: "Reconciliation", desc: "Cash discrepancies and alerts", on: notifReconciliation, set: setNotifReconciliation },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-white/6 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-white/80">{item.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle on={item.on} onChange={item.set} />
                  </div>
                ))}
              </div>
              <Select label="Email Digest" value={emailDigest} onChange={(e) => setEmailDigest(e.target.value)}>
                <option value="realtime">Real-time</option>
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </Select>
              <Button variant="primary" onClick={() => toast("Notification preferences saved")}>Save Preferences</Button>
            </div>
          )}

          {section === "access" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Account & Access</h2>
                <p className="text-sm text-white/40">Manage your account credentials and session.</p>
              </div>
              <div className="space-y-4">
                <Input label="Manager Name" defaultValue="Fleet Manager" />
                <Input label="Email Address" defaultValue="manager@koja.ng" />
                <div className="pt-4 border-t border-white/8 space-y-3">
                  <Button variant="secondary" className="w-full" onClick={() => toast("Password reset email sent", "info")}>
                    Change Password
                  </Button>
                  <Button variant="danger" className="w-full" onClick={() => toast("Signed out", "info")}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member" description="They'll receive an email to set their password.">
        <div className="space-y-4">
          <Input label="Full Name *" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Firstname Lastname" />
          <Input label="Email Address *" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@koja.ng" />
          <Select label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            <option value="fleet_manager">Fleet Manager</option>
            <option value="scheduler">Scheduler / Rostering Officer</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="finance">Finance Officer</option>
            <option value="auditor">Read-Only Auditor</option>
          </Select>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleInvite} disabled={!inviteName || !inviteEmail}>
              Send Invitation
            </Button>
          </div>
        </div>
      </Dialog>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
