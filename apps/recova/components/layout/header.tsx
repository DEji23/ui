"use client"

import * as React from "react"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "./sidebar-context"

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  showSearch?: boolean
}

export function Header({ title, description, actions, showSearch = false }: HeaderProps) {
  const { openMobile } = useSidebar()

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-sm gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden shrink-0"
          onClick={openMobile}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-8 w-52 bg-muted/50 pl-8 text-xs border-0 focus-visible:ring-1"
            />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
          {description && <p className="text-xs text-muted-foreground truncate hidden sm:block">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {actions}
        <Button variant="ghost" size="icon-sm" className="relative shrink-0">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
      </div>
    </div>
  )
}
