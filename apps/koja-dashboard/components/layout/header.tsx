"use client"

import { useState, type ReactNode } from "react"
import { Notification, SearchNormal1, CloseCircle, Warning2, TickCircle, Timer1, HambergerMenu } from "iconsax-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSidebar } from "./app-layout"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

type NotifType = "alert" | "warning" | "success" | "info"
interface Notif { id: string; type: NotifType; title: string; body: string; time: string; read: boolean }

const INITIAL_NOTIFS: Notif[] = [
  { id: "n1", type: "alert", title: "No-show flagged", body: "Emeka Obi hasn't accepted his morning shift", time: "2 min ago", read: false },
  { id: "n2", type: "warning", title: "Inspection overdue — KJA-004", body: "Pre-trip inspection is 3 days overdue", time: "1 hr ago", read: false },
  { id: "n3", type: "success", title: "Revenue target reached", body: "Today's collections exceeded ₦450,000", time: "3 hrs ago", read: true },
  { id: "n4", type: "warning", title: "Low fuel — KJA-002", body: "Fuel level at 18%. Schedule refuel before next trip.", time: "5 hrs ago", read: true },
  { id: "n5", type: "info", title: "New leave request", body: "Adewale Suleiman submitted annual leave (3 days)", time: "Yesterday", read: true },
]

function NotifIcon({ type }: { type: NotifType }) {
  if (type === "alert") return <Warning2 size={14} color="#f87171" variant="Bold" />
  if (type === "warning") return <Warning2 size={14} color="#f59e0b" variant="Bold" />
  if (type === "success") return <TickCircle size={14} color="#34d399" variant="Bold" />
  return <Notification size={14} color="#60a5fa" variant="Bold" />
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)
  const { openMobile } = useSidebar()

  const unreadCount = notifs.filter((n) => !n.read).length

  function markAllRead() {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })))
  }

  function markRead(id: string) {
    setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x))
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between px-4 sm:px-6 backdrop-blur-sm",
        "border-b dark:border-white/[0.06] border-zinc-200",
        "dark:bg-[#09090b]/90 bg-white/90"
      )}>
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
          <button
            onClick={openMobile}
            className="lg:hidden text-zinc-500 dark:hover:text-zinc-300 hover:text-zinc-700 transition-colors shrink-0"
          >
            <HambergerMenu size={18} color="currentColor" />
          </button>
          {searchOpen ? (
            <Input
              autoFocus
              placeholder="Search drivers, buses, routes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearch("") } }}
              className="max-w-xs h-7 text-xs"
            />
          ) : (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold dark:text-zinc-100 text-zinc-900">{title}</h1>
              {subtitle && <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => { setSearchOpen((s) => !s); setSearch("") }}
            className={cn(searchOpen && "text-amber-400 bg-amber-500/10")}
          >
            <SearchNormal1 size={15} color="currentColor" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="relative" onClick={() => setNotifOpen(true)}>
            <Notification size={15} color="currentColor" variant="Linear" />
            {unreadCount > 0 && (
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"
                style={{ boxShadow: "0 0 4px #f59e0b" }}
              />
            )}
          </Button>
        </div>
      </header>

      {/* Notifications drawer backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          notifOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setNotifOpen(false)}
      />

      {/* Notifications drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-[380px] shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          "dark:bg-[#0f1011] bg-white",
          "border-l dark:border-white/[0.07] border-zinc-200",
          notifOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-white/[0.06] border-zinc-200 shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold dark:text-zinc-100 text-zinc-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-zinc-500 dark:hover:text-zinc-300 hover:text-zinc-700 px-2 py-1 rounded transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setNotifOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 dark:hover:text-zinc-300 hover:text-zinc-700 dark:hover:bg-white/5 hover:bg-zinc-100 transition-colors"
            >
              <CloseCircle size={16} color="currentColor" variant="Linear" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">No notifications</div>
          ) : (
            <div className="dark:divide-white/[0.04] divide-zinc-100 divide-y">
              {notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left flex gap-3 px-5 py-4 transition-colors",
                    "dark:hover:bg-white/[0.02] hover:bg-zinc-50",
                    !n.read && "dark:bg-white/[0.015] bg-zinc-50"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                    n.type === "alert" ? "bg-red-500/10" :
                    n.type === "warning" ? "bg-amber-500/10" :
                    n.type === "success" ? "bg-emerald-500/10" : "bg-blue-500/10"
                  )}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-semibold leading-snug", n.read ? "text-zinc-500" : "dark:text-zinc-100 text-zinc-900")}>
                        {n.title}
                      </p>
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{n.body}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Timer1 size={10} color="#71717a" variant="Linear" />
                      <p className="text-[10px] text-zinc-500">{n.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t dark:border-white/[0.06] border-zinc-200 shrink-0">
          <p className="text-[11px] text-zinc-500 text-center">Showing last 5 notifications</p>
        </div>
      </div>
    </>
  )
}
