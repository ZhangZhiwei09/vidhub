import { eq } from 'drizzle-orm'
import { follows, users } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { StudioShell } from '../_shell'
import { UserList } from '@/components/user-list'

export default async function StudioFollowingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/studio/following')
  const uid = Number(session.user.id)

  const list = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followId, users.id))
    .where(eq(follows.uid, uid))

  return (
    <StudioShell tab="following">
      <UserList users={list} />
    </StudioShell>
  )
}