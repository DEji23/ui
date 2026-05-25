"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface SidebarCtxValue {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarCtxValue>({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => {},
  openMobile: () => {},
  closeMobile: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        toggleCollapsed: () => setCollapsed((c) => !c),
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      <div className="flex min-h-screen bg-[var(--bg)]">
        <Sidebar />
        <div
          className={cn(
            "flex flex-1 flex-col min-h-screen transition-[margin] duration-300 min-w-0",
            "ml-0",
            collapsed ? "lg:ml-[60px]" : "lg:ml-[220px]"
          )}
        >
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
