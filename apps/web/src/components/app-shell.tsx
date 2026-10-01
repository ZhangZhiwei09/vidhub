'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SiteNav } from '@/components/site-nav'

export function AppShell({
  loggedIn,
  isAdmin,
  userName,
  notifySlot,
  signOutAction,
  children,
}: {
  loggedIn: boolean
  isAdmin?: boolean
  userName?: string | null
  notifySlot?: React.ReactNode
  signOutAction: () => Promise<void>
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const onAdmin = pathname.startsWith('/admin')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('is-admin', onAdmin)
    document.body.classList.toggle('is-cinema', !onAdmin)
    return () => {
      document.body.classList.remove('is-admin', 'is-cinema')
    }
  }, [onAdmin])

  useEffect(() => {
    if (onAdmin) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onAdmin])

  const isHome = pathname === '/'

  if (onAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background,backdrop-filter,border-color,box-shadow] duration-300 ease-out ${
          isHome ? '-mb-14' : ''
        } ${
          scrolled || !isHome
            ? 'border-b border-white/[0.06] bg-black/70 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-8 px-6 md:px-12">
          <Link
            href="/"
            className="shrink-0 text-[21px] font-bold tracking-tight text-white transition hover:opacity-90"
          >
            VidHub
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:justify-between">
            <SiteNav
              loggedIn={loggedIn}
              isAdmin={isAdmin}
              userName={userName}
              notifySlot={notifySlot}
              signOutAction={signOutAction}
            />
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
