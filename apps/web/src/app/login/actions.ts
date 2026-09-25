'use server'

import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '@vidhub/db/schema'
import { registerSchema } from '@vidhub/shared'
import { db } from '@/lib/db'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export type AuthActionState = {
  error?: string
  success?: boolean
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    account: formData.get('account'),
    password: formData.get('password'),
    username: formData.get('username') || undefined,
  })

  if (!parsed.success) {
    return { error: '请检查账号密码格式（密码至少 6 位）' }
  }

  const { account, password, username } = parsed.data
  const [exists] = await db.select().from(users).where(eq(users.account, account)).limit(1)
  if (exists) {
    return { error: '账号已存在' }
  }

  const passwordHash = await hash(password, 10)
  await db.insert(users).values({
    account,
    passwordHash,
    username: username || account,
  })

  try {
    await signIn('credentials', {
      account,
      password,
      redirectTo: '/',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: '注册成功但自动登录失败，请手动登录' }
    }
    throw err
  }

  return { success: true }
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await signIn('credentials', {
      account: formData.get('account'),
      password: formData.get('password'),
      redirectTo: (formData.get('callbackUrl') as string) || '/',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: '账号或密码错误' }
    }
    throw err
  }
  return { success: true }
}