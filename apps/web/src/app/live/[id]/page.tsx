import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { lives, users } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { LivePlayer } from '@/components/live-player'

type Props = { params: Promise<{ id: string }> }

export default async function LiveRoomPage({ params }: Props) {
  const id = Number((await params).id)
  if (!Number.isFinite(id)) notFound()

  const [row] = await db
    .select({
      id: lives.id,
      title: lives.title,
      playUrl: lives.playUrl,
      username: users.username,
    })
    .from(lives)
    .innerJoin(users, eq(lives.uid, users.id))
    .where(eq(lives.id, id))
    .limit(1)

  if (!row) notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <LivePlayer playUrl={row.playUrl} title={`${row.title} · ${row.username}`} />
    </main>
  )
}