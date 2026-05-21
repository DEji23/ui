import { type ReactNode } from "react"
import { Notification, SearchNormal1 } from "iconsax-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#09090b]/90 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        {action}
        <Button variant="ghost" size="icon-sm">
          <SearchNormal1 size={15} color="currentColor" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Notification size={15} color="currentColor" variant="Linear" />
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"
            style={{ boxShadow: "0 0 4px #f59e0b" }}
          />
        </Button>
      </div>
    </header>
  )
}
