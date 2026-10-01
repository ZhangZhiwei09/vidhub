import { AdminSimpleTable } from '@/components/admin-simple-table'

export default function AdminDanmakusPage() {
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">弹幕管理</h1>
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
    </div>
  )
}
