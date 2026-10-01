import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { MessageClient } from '@/components/message-client'

export default async function MessagePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/message')

  return (
    <main className="vh-page">
      <h1 className="vh-page-title text-white">消息</h1>
      <MessageClient selfId={Number(session.user.id)} />
    </main>
  )
}
