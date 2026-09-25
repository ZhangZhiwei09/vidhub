import Link from 'next/link'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { auth, signOut } from '@/auth'
import { NotifyBadge } from '@/components/notify-badge'
import { SiteNav } from '@/components/site-nav'
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
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-50 text-zinc-900 antialiased`}>
        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
              VidHub
            </Link>
            <SiteNav
              loggedIn={!!session?.user}
              isAdmin={session?.user?.role === 'admin'}
              userName={session?.user?.name}
              notifySlot={session?.user ? <NotifyBadge /> : null}
              signOutAction={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}