import Link from 'next/link'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { auth, signOut } from '@/auth'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'VidHub',
  description: '视频分享站点',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-50 antialiased`}>
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
              VidHub
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-700">
              <Link href="/">首页</Link>
              <Link href="/popular">热门</Link>
              <Link href="/search">搜索</Link>
              <Link href="/upload">投稿</Link>
              <Link href="/live">直播</Link>
              <Link href="/message">消息</Link>
              {session?.user ? (
                <>
                  <span>{session.user.name}</span>
                  {session.user.role === 'admin' ? <Link href="/admin">管理</Link> : null}
                  <form
                    action={async () => {
                      'use server'
                      await signOut({ redirectTo: '/' })
                    }}
                  >
                    <button type="submit" className="text-zinc-500 hover:text-zinc-900">
                      退出
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login">登录</Link>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}