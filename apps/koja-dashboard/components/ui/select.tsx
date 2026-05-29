"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const baseClass =
  "flex h-9 w-full rounded-lg border border-line-input bg-input-bg px-3 py-1 text-sm text-fg outline-none transition-colors focus:border-amber-500/50 cursor-pointer"

// ─── Simple native select (existing usage: <Select onChange={...}><option>…</option></Select>)
type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  onValueChange?: never
}

// ─── Compound select context
interface SelectCtxValue {
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  triggerClass: string
  setTriggerClass: (c: string) => void
  setPlaceholder: (p: string) => void
}
const SelectCtx = React.createContext<SelectCtxValue | null>(null)

interface CompoundSelectProps {
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
  className?: string
}

// ─── Select — handles both simple and compound usage
export function Select(props: NativeSelectProps | CompoundSelectProps) {
  if ("onValueChange" in props && props.onValueChange !== undefined) {
    return <CompoundSelect {...(props as CompoundSelectProps)} />
  }
  const { className, children, ...rest } = props as NativeSelectProps
  return (
    <select className={cn(baseClass, className)} {...rest}>
      {children}
    </select>
  )
}
Select.displayName = "Select"

function CompoundSelect({ value, onValueChange, children, className }: CompoundSelectProps) {
  const [triggerClass, setTriggerClass] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("")
  return (
    <SelectCtx.Provider value={{ value, onValueChange, placeholder, triggerClass, setTriggerClass, setPlaceholder }}>
      <div className={cn("relative w-full", className)}>{children}</div>
    </SelectCtx.Provider>
  )
}

// ─── SelectTrigger — captures styling intent; SelectContent renders the actual select
export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectCtx)
  React.useEffect(() => {
    if (ctx && className) ctx.setTriggerClass(className)
  }, [className]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ─── SelectValue — captures placeholder
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectCtx)
  React.useEffect(() => {
    if (ctx && placeholder) ctx.setPlaceholder(placeholder)
  }, [placeholder]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ─── SelectContent — renders the native <select> with all collected props
export function SelectContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectCtx)
  if (!ctx) return null
  return (
    <select
      value={ctx.value}
      onChange={(e) => ctx.onValueChange(e.target.value)}
      className={cn(baseClass, ctx.triggerClass, className)}
    >
      {ctx.placeholder && (
        <option value="" disabled>
          {ctx.placeholder}
        </option>
      )}
      {children}
    </select>
  )
}

// ─── SelectItem — renders as <option>
export function SelectItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  return <option value={value} className={className}>{children}</option>
}

// ─── SelectOption (legacy helper)
export function SelectOption({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value} className="bg-elevated text-fg">{children}</option>
}
