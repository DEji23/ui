import { Sidebar } from "@/components/layout/sidebar"

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="lg:pl-[255px]">
        <div className="mx-auto min-h-screen max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
