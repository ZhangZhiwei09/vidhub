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
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              active
                ? 'bg-white text-black'
                : 'border border-white/20 text-white/70 hover:border-white/40 hover:text-white'
            }`}
          >
            {p.name}
          </Link>
        )
      })}
    </div>
  )
}
