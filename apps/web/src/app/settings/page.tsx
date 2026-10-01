import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ProfileSettingsForm } from '@/components/profile-settings-form'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/settings')

  return (
    <main className="vh-page">
      <h1 className="vh-page-title text-white">账号设置</h1>
      <ProfileSettingsForm />
    </main>
  )
}
