import { notifications } from '@vidhub/db/schema'
import { db } from '@/lib/db'

export async function createNotification(input: {
  toId: number
  fromId?: number | null
  type: string
  content: string
}) {
  if (!input.toId) return
  if (input.fromId && input.fromId === input.toId) return
  await db.insert(notifications).values({
    toId: input.toId,
    fromId: input.fromId ?? null,
    type: input.type,
    content: input.content,
  })
}