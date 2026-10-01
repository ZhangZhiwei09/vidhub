'use client'

import Link from 'next/link'

export type VideoCardData = {
  id: number
  title: string
  cover: string | null
  username: string
  clicks: number
}

export function VideoCard({
  video,
  variant = 'cinema',
}: {
  video: VideoCardData
  variant?: 'cinema' | 'rail' | 'admin'
}) {
  if (variant === 'rail') {
    return (
      <Link href={`/video/${video.id}`} className="group block w-[220px] shrink-0 md:w-[240px]">
        <div className="aspect-video overflow-hidden rounded-[12px] bg-white/10 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-white/25 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          {video.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.cover}
              alt={video.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/40">无封面</div>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-1 text-[13px] font-semibold text-white transition group-hover:text-white/95">
          {video.title}
        </h3>
        <p className="mt-0.5 text-[12px] text-white/45">
          {video.username} · {video.clicks} 播放
        </p>
      </Link>
    )
  }

  return (
    <Link
      href={`/video/${video.id}`}
      className="group block overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-white/10 transition hover:bg-white/[0.07] hover:ring-white/20"
    >
      <div className="aspect-video bg-white/10">
        {video.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.cover}
            alt={video.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">无封面</div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-white">{video.title}</h3>
        <p className="text-xs text-white/45">
          {video.username} · {video.clicks} 播放
        </p>
      </div>
    </Link>
  )
}
