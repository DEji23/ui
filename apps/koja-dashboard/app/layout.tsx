import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

export const metadata: Metadata = {
  title: "KOJA Fleet Dashboard",
  description: "Fleet Owner Operations Dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="ml-[220px] min-h-screen">{children}</main>
      </body>
    </html>
  )
}
