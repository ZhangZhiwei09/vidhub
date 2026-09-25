'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function AdminSimpleTable({
  resource,
  columns,
  deleteAction,
}: {
  resource: 'users' | 'comments' | 'danmakus'
  columns: Array<{ key: string; label: string }>
  deleteAction?: string
}) {
  const [list, setList] = useState<Array<Record<string, unknown>>>([])

  async function load() {
    const res = await fetch(`/api/admin?resource=${resource}`)
    const json = await res.json()
    setList(json?.data?.list ?? [])
  }

  useEffect(() => {
    void load()
  }, [resource])

  async function remove(id: number) {
    if (!deleteAction || !confirm('确认删除？')) return
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: deleteAction, id }),
    })
    await load()
  }

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-zinc-500">
        ← 仪表盘
      </Link>
      <table className="w-full overflow-hidden rounded-xl bg-white text-left text-sm ring-1 ring-zinc-200">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2">
                {c.label}
              </th>
            ))}
            {deleteAction ? <th className="px-3 py-2">操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr key={String(row.id)} className="border-t border-zinc-100">
              {columns.map((c) => (
                <td key={c.key} className="max-w-xs truncate px-3 py-2">
                  {String(row[c.key] ?? '')}
                </td>
              ))}
              {deleteAction ? (
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => void remove(Number(row.id))}
                  >
                    删除
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}