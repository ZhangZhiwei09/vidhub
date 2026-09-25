import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminCommentsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">评论管理</h1>
      <AdminSimpleTable
        resource="comments"
        deleteAction="delete-comment"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'vid', label: '视频' },
          { key: 'uid', label: '用户' },
          { key: 'content', label: '内容' },
        ]}
      />
    </main>
  )
}