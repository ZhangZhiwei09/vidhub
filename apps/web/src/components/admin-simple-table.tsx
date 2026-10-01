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
    <div className="overflow-hidden rounded-[14px] border border-[var(--vh-admin-hairline)] bg-white shadow-[var(--vh-shadow-card)]">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-[var(--vh-admin-hairline)] bg-black/[0.015] text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--vh-admin-tertiary)]">
            {columns.map((c) => (
              <th key={c.key} className="px-5 py-2.5">
                {c.label}
              </th>
            ))}
            {deleteAction ? <th className="px-5 py-2.5">操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr
              key={String(row.id)}
              className="border-b border-[var(--vh-admin-hairline)] last:border-0 hover:bg-[rgba(0,113,227,0.04)]"
            >
              {columns.map((c) => (
                <td key={c.key} className="max-w-xs truncate px-5 py-3">
                  {String(row[c.key] ?? '')}
                </td>
              ))}
              {deleteAction ? (
                <td className="px-5 py-3">
                  <button
                    type="button"
                    className="font-medium text-red-600 hover:opacity-80"
                    onClick={() => void remove(Number(row.id))}
                  >
                    删除
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
          {list.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (deleteAction ? 1 : 0)}
                className="px-5 py-10 text-center text-[var(--vh-admin-tertiary)]"
              >
                暂无数据
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <div className="border-t border-[var(--vh-admin-hairline)] px-5 py-3">
        <Link href="/admin" className="text-[13px] font-medium text-[var(--vh-accent)]">
          ← 返回仪表盘
        </Link>
      </div>
    </div>
  )
}
