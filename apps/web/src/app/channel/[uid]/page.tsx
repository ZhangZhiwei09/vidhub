import { redirect } from 'next/navigation'

type Props = { params: Promise<{ uid: string }> }

export default async function ChannelIndex({ params }: Props) {
  const { uid } = await params
  redirect(`/channel/${uid}/works`)
}