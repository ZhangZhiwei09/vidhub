import { AdminDashboard } from '@/components/admin-dashboard'

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">管理后台</h1>
      <AdminDashboard />
    </main>
  )
}