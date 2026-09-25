import { eq } from 'drizzle-orm'
import { follows, users } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { StudioShell } from '../_shell'
import { UserList } from '@/components/user-list'

export default async function StudioFansPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/studio/fans')
  const uid = Number(session.user.id)

  const list = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
    })
    .from(follows)
    .innerJoin(users, eq(follows.uid, users.id))
    .where(eq(follows.followId, uid))

  return (
    <StudioShell tab="fans">
      <UserList users={list} />
    </StudioShell>
  )
}