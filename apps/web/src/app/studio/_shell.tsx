import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { follows, users } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { ProfileHeader, ProfileTabs } from '@/components/profile-header'
import Link from 'next/link'

async function getProfile(uid: number) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      sign: users.sign,
    })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1)
  if (!user) return null
  const followingCount = (await db.select().from(follows).where(eq(follows.uid, uid))).length
  const fansCount = (await db.select().from(follows).where(eq(follows.followId, uid))).length
  return { ...user, followingCount, fansCount }
}

export async function StudioShell({
  tab,
  children,
}: {
  tab: string
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/studio/works')
  const uid = Number(session.user.id)
  const profile = await getProfile(uid)
  if (!profile) redirect('/login')

  return (
    <main className="vh-page">
      <ProfileHeader
        user={profile}
        actions={
          <Link
            href={`/channel/${uid}`}
            className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:border-white/40 hover:text-white"
          >
            公开主页
          </Link>
        }
      />
      <ProfileTabs basePath="/studio" active={tab} />
      {children}
    </main>
  )
}