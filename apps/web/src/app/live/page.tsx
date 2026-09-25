import { LiveLobby } from '@/components/live-lobby'

export default function LivePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">直播</h1>
      <LiveLobby />
    </main>
  )
}