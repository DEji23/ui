import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KOJA Fleet Dashboard",
  description: "Real-time fleet operations management for KOJA Transport",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-[#09090b]">
          <Sidebar />
          <div className="flex flex-1 flex-col min-h-screen ml-[220px]">{children}</div>
        </div>
      </body>
    </html>
  )
}
