'use client'

import { useActionState, useState } from 'react'
import { loginAction, registerAction, type AuthActionState } from './actions'

const initial: AuthActionState = {}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initial)
  const [regState, regFormAction, regPending] = useActionState(registerAction, initial)

  return (
    <div className={`vh-auth-shell ${mode === 'register' ? 'is-register' : ''}`}>
      <div className="vh-auth-brand">Vid<span>Hub</span></div>
      <section className="vh-auth-intro">
        <p className="vh-auth-eyebrow">A place for moving images</p>
        <h1 className={mode === 'login' ? 'is-visible' : ''}>欢迎回来。</h1>
        <h1 className={mode === 'register' ? 'is-visible' : ''}>从第一帧开始。</h1>
        <p className="vh-auth-copy">继续观看你收藏的作品，或把下一段故事分享给更多人。</p>
      </section>
      <section className="vh-auth-panel">
        <form action={loginFormAction} className={`vh-auth-form ${mode === 'login' ? 'is-active' : ''}`}>
          <h2>登录 VidHub</h2>
          <p className="vh-auth-subtitle">进入你的观看与创作空间</p>
          <input type="hidden" name="callbackUrl" value={callbackUrl || '/'} />
          <label className="vh-auth-field">账号<input name="account" required autoComplete="username" /></label>
          <label className="vh-auth-field">密码<input name="password" type="password" required minLength={6} autoComplete="current-password" /></label>
          {loginState.error ? <p className="vh-auth-error">{loginState.error}</p> : null}
          <button type="submit" disabled={loginPending} className="vh-auth-primary">{loginPending ? '登录中…' : '登录'}</button>
          <p className="vh-auth-switch">还没有账号？ <button type="button" onClick={() => setMode('register')}>注册</button></p>
          <p className="vh-auth-legal">登录即表示你同意 VidHub 的服务条款与隐私政策。</p>
        </form>

        <form action={regFormAction} className={`vh-auth-form ${mode === 'register' ? 'is-active' : ''}`}>
          <button type="button" className="vh-auth-back" onClick={() => setMode('login')}>← 返回登录</button>
          <h2>创建账号</h2>
          <p className="vh-auth-subtitle">让你的作品有一个新的起点</p>
          <label className="vh-auth-field">账号<input name="account" required autoComplete="username" /></label>
          <label className="vh-auth-field">昵称（可选）<input name="username" autoComplete="nickname" /></label>
          <label className="vh-auth-field">密码<input name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
          {regState.error ? <p className="vh-auth-error">{regState.error}</p> : null}
          <button type="submit" disabled={regPending} className="vh-auth-primary">{regPending ? '注册中…' : '注册并开始'}</button>
          <p className="vh-auth-switch">已有账号？ <button type="button" onClick={() => setMode('login')}>直接登录</button></p>
        </form>
      </section>
    </div>
  )
}
