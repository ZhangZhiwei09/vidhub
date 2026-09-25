import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 px-8 py-16 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">VidHub</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight">下一代视频分享站点</h1>
        <p className="mt-4 max-w-lg text-zinc-300">
          Next.js + PostgreSQL 重构中。账号体系已就绪，视频与直播能力按功能点陆续迁移。
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900">
            开始使用
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white"
          >
            管理后台
          </Link>
        </div>
      </section>
    </main>
  )
}