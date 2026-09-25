import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminDanmakusPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">弹幕管理</h1>
      <AdminSimpleTable
        resource="danmakus"
        deleteAction="delete-danmaku"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'vid', label: '视频' },
          { key: 'uid', label: '用户' },
          { key: 'text', label: '内容' },
          { key: 'time', label: '时间点' },
        ]}
      />
    </main>
  )
}