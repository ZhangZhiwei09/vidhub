import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { users } from '@vidhub/db/schema'
import { loginSchema } from '@vidhub/shared'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'
import { db } from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        account: { label: 'Account', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.account, parsed.data.account))
          .limit(1)

        if (!user) return null

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null

        return {
          id: String(user.id),
          name: user.username,
          email: user.account,
          image: user.avatar ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
})