import { and, desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video-card'
import { PartitionTabs } from '@/components/partition-tabs'

async function getVideos(partitionId: number) {
  try {
    const conditions = [eq(videos.status, 'approved')]
    if (partitionId !== 0) conditions.push(eq(videos.partitionId, partitionId))

    return await db
      .select({
        id: videos.id,
        title: videos.title,
        cover: videos.cover,
        username: users.username,
        clicks: videos.clicks,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(24)
  } catch (err) {
    console.error('[home] getVideos failed:', err)
    return []
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ partition?: string }>
}) {
  const params = await searchParams
  const partitionId = Number(params.partition ?? 0) || 0
  const list = await getVideos(partitionId)
  const featured = list[0]
  const railA = list.slice(0, 8)
  const railB = list.slice(8, 16)

  return (
    <main className="pb-16">
      <section className="relative isolate min-h-[78vh] overflow-hidden md:min-h-[86vh]">
        <div className="absolute inset-0 overflow-hidden">
          {featured?.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featured.cover}
              alt=""
              className="vh-hero-media h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-black to-zinc-900" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-[1440px] flex-col justify-end px-6 pb-16 pt-28 md:min-h-[86vh] md:px-12 md:pb-20">
          <p className="vh-fade-up text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Featured
          </p>
          <h1 className="vh-fade-up vh-fade-up-delay-1 mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.05]">
            {featured?.title || '发现精彩视频'}
          </h1>
          <p className="vh-fade-up vh-fade-up-delay-2 mt-4 max-w-lg text-[15px] leading-relaxed text-white/65 md:text-base">
            {featured
              ? `${featured.username} · ${featured.clicks} 播放`
              : '列表、详情与分片投稿已接入。登录后即可上传。'}
          </p>
          <div className="vh-fade-up vh-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
            {featured ? (
              <Link href={`/video/${featured.id}`} className="vh-btn-primary">
                立即观看
              </Link>
            ) : (
              <Link href="/upload" className="vh-btn-primary">
                去投稿
              </Link>
            )}
            <Link href="/popular" className="vh-btn-ghost">
              热门
            </Link>
            <Link href="/upload" className="vh-btn-ghost">
              去投稿
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 pt-8 md:px-12">
        <PartitionTabs activeId={partitionId} />

        {list.length === 0 ? (
          <p className="text-white/45">该分区暂无已通过审核的视频。</p>
        ) : (
          <>
            <section className="mb-12">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">精选</h2>
                <Link
                  href="/popular"
                  className="text-[13px] text-white/45 transition hover:text-white/80"
                >
                  查看全部
                </Link>
              </div>
              <div className="vh-rail flex gap-3.5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {railA.map((v) => (
                  <VideoCard key={`a-${v.id}`} video={v} variant="rail" />
                ))}
              </div>
            </section>

            {railB.length > 0 ? (
              <section className="mb-12">
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">更多</h2>
                </div>
                <div className="vh-rail flex gap-3.5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {railB.map((v) => (
                    <VideoCard key={`b-${v.id}`} video={v} variant="rail" />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-5 text-lg font-semibold tracking-tight text-white md:text-xl">
                全部内容
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
