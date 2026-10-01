import Link from 'next/link'
import { PARTITIONS } from '@vidhub/shared'

export function PartitionTabs({ activeId = 0 }: { activeId?: number }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {PARTITIONS.map((p) => {
        const href = p.id === 0 ? '/' : `/?partition=${p.id}`
        const active = activeId === p.id
        return (
          <Link
            key={p.id}
            href={href}
            className={`rounded-full px-3 py-1.5 text-sm ${active ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50'}`}
          >
            {p.name}
          </Link>
        )
      })}
    </div>
  )
}