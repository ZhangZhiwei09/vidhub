import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">用户管理</h1>
      <AdminSimpleTable
        resource="users"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'account', label: '账号' },
          { key: 'username', label: '昵称' },
          { key: 'role', label: '角色' },
        ]}
      />
    </div>
  )
}
