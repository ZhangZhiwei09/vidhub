'use client'

import Link from 'next/link'

export type VideoCardData = {
  id: number
  title: string
  cover: string | null
  username: string
  clicks: number
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <Link href={`/video/${video.id}`} className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
      <div className="aspect-video bg-zinc-200">
        {video.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.cover}
            alt={video.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">无封面</div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">{video.title}</h3>
        <p className="text-xs text-zinc-500">
          {video.username} · {video.clicks} 播放
        </p>
      </div>
    </Link>
  )
}