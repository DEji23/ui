"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface SidebarCtxValue {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  openMobile: () => void
  closeMobile: () => void
}

interface ThemeCtxValue {
  theme: "dark" | "light"
  toggleTheme: () => void
}

const SidebarContext = createContext<SidebarCtxValue>({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => {},
  openMobile: () => {},
  closeMobile: () => {},
})

const ThemeContext = createContext<ThemeCtxValue>({
  theme: "dark",
  toggleTheme: () => {},
})

export const useSidebar = () => useContext(SidebarContext)
export const useTheme = () => useContext(ThemeContext)

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("koja-theme")
      if (saved === "light") setTheme("light")
    } catch {}
  }, [])

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark"
      try { localStorage.setItem("koja-theme", next) } catch {}
      if (next === "light") {
        document.documentElement.classList.add("light")
      } else {
        document.documentElement.classList.remove("light")
      }
      return next
    })
  }

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
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="flex min-h-screen bg-app-bg">
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
      </ThemeContext.Provider>
    </SidebarContext.Provider>
  )
}
