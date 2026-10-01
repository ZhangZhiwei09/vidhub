import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { auth, signOut } from '@/auth'
import { AppShell } from '@/components/app-shell'
import { NotifyBadge } from '@/components/notify-badge'
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} is-cinema min-h-screen antialiased`}
      >
        <AppShell
          loggedIn={!!session?.user}
          isAdmin={session?.user?.role === 'admin'}
          userName={session?.user?.name}
          notifySlot={session?.user ? <NotifyBadge /> : null}
          signOutAction={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          {children}
        </AppShell>
      </body>
    </html>
  )
}
