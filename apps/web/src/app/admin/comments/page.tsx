import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminCommentsPage() {
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">评论管理</h1>
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
    </div>
  )
}
