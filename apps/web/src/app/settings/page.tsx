import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ProfileSettingsForm } from '@/components/profile-settings-form'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/settings')

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">账号设置</h1>
      <ProfileSettingsForm />
    </main>
  )
}