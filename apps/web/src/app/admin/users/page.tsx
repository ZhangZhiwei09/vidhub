import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminUsersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">用户管理</h1>
      <AdminSimpleTable
        resource="users"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'account', label: '账号' },
          { key: 'username', label: '昵称' },
          { key: 'role', label: '角色' },
        ]}
      />
    </main>
  )
}