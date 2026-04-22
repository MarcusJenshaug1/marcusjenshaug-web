import { AdminNav } from '@/components/AdminNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <AdminNav />
      <main className="flex-1 p-10 max-w-4xl">{children}</main>
    </div>
  )
}
