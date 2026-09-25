import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { createDb, users } from '@vidhub/db'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  const db = createDb(url)

  const account = process.env.SEED_ADMIN_ACCOUNT || 'admin'
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const [exists] = await db.select().from(users).where(eq(users.account, account)).limit(1)
  if (exists) {
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, exists.id))
    console.log(`updated existing user ${account} to admin`)
  } else {
    await db.insert(users).values({
      account,
      passwordHash: await hash(password, 10),
      username: 'Admin',
      role: 'admin',
    })
    console.log(`created admin ${account} / ${password}`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})