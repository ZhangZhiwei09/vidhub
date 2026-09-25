'use client'

import { useActionState } from 'react'
import { loginAction, registerAction, type AuthActionState } from './actions'

const initial: AuthActionState = {}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initial)
  const [regState, regFormAction, regPending] = useActionState(registerAction, initial)

  return (
    <div className="mx-auto grid w-full max-w-md gap-8">
      <form action={loginFormAction} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">登录 VidHub</h1>
        <input type="hidden" name="callbackUrl" value={callbackUrl || '/'} />
        <label className="text-sm text-zinc-600">
          账号
          <input
            name="account"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
            autoComplete="username"
          />
        </label>
        <label className="text-sm text-zinc-600">
          密码
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
            autoComplete="current-password"
          />
        </label>
        {loginState.error ? <p className="text-sm text-red-600">{loginState.error}</p> : null}
        <button
          type="submit"
          disabled={loginPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {loginPending ? '登录中…' : '登录'}
        </button>
      </form>

      <form action={regFormAction} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">注册</h2>
        <label className="text-sm text-zinc-600">
          账号
          <input name="account" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-600">
          昵称（可选）
          <input name="username" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-600">
          密码
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        {regState.error ? <p className="text-sm text-red-600">{regState.error}</p> : null}
        <button
          type="submit"
          disabled={regPending}
          className="rounded-md border border-zinc-900 px-4 py-2 text-zinc-900 disabled:opacity-60"
        >
          {regPending ? '注册中…' : '注册并登录'}
        </button>
      </form>
    </div>
  )
}