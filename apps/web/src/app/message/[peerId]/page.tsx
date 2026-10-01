import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { MessageClient } from '@/components/message-client'

type Props = { params: Promise<{ peerId: string }> }

export default async function MessagePeerPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/message')
  const { peerId } = await params
  const id = Number(peerId)
  if (!Number.isFinite(id)) redirect('/message')

  return (
    <main className="vh-page">
      <h1 className="vh-page-title text-white">消息</h1>
      <MessageClient selfId={Number(session.user.id)} peerId={id} />
    </main>
  )
}
