import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { UploadForm } from './upload-form'

export default async function UploadPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/upload')
  }

  return (
    <main className="vh-page">
      <UploadForm />
    </main>
  )
}