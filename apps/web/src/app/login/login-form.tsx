'use client'

import { useActionState } from 'react'
import { loginAction, registerAction, type AuthActionState } from './actions'

const initial: AuthActionState = {}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initial)
  const [regState, regFormAction, regPending] = useActionState(registerAction, initial)

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <form
        action={loginFormAction}
        className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
      >
        <h1 className="text-xl font-semibold tracking-tight text-white">登录 VidHub</h1>
        <input type="hidden" name="callbackUrl" value={callbackUrl || '/'} />
        <label className="text-sm text-white/55">
          账号
          <input name="account" required className="vh-input mt-1" autoComplete="username" />
        </label>
        <label className="text-sm text-white/55">
          密码
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="vh-input mt-1"
            autoComplete="current-password"
          />
        </label>
        {loginState.error ? <p className="text-sm text-red-400">{loginState.error}</p> : null}
        <button type="submit" disabled={loginPending} className="vh-btn-accent mt-1 disabled:opacity-60">
          {loginPending ? '登录中…' : '登录'}
        </button>
      </form>

      <form
        action={regFormAction}
        className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
      >
        <h2 className="text-lg font-semibold tracking-tight text-white">注册</h2>
        <label className="text-sm text-white/55">
          账号
          <input name="account" required className="vh-input mt-1" />
        </label>
        <label className="text-sm text-white/55">
          昵称（可选）
          <input name="username" className="vh-input mt-1" />
        </label>
        <label className="text-sm text-white/55">
          密码
          <input name="password" type="password" required minLength={6} className="vh-input mt-1" />
        </label>
        {regState.error ? <p className="text-sm text-red-400">{regState.error}</p> : null}
        <button
          type="submit"
          disabled={regPending}
          className="vh-btn-ghost mt-1 disabled:opacity-60"
        >
          {regPending ? '注册中…' : '注册并登录'}
        </button>
      </form>
    </div>
  )
}
