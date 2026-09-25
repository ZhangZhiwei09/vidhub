import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { NotificationPanel } from '@/components/notification-panel'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/notifications')
  return <NotificationPanel />
}