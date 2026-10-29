'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthClient } from 'better-auth/react'

const authClient = createAuthClient({ baseURL: typeof window !== 'undefined' ? window.location.origin : undefined })

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setPending(true)
    const result = mode === 'sign-in' ? await authClient.signIn.email({ email, password }) : await authClient.signUp.email({ name, email, password })
    setPending(false)
    if (result.error) { setError('Unable to authenticate with those details.'); return }
    router.push('/'); router.refresh()
  }

  return <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/10 bg-[#0d1727] p-6 shadow-2xl">
    <div><p className="text-xs uppercase tracking-[0.16em] text-indigo-300">Nexus</p><h1 className="mt-2 text-2xl font-semibold text-white">{mode === 'sign-in' ? 'Welcome back' : 'Create your workspace'}</h1><p className="mt-1 text-sm text-slate-500">{mode === 'sign-in' ? 'Sign in to continue.' : 'Start organizing your software work.'}</p></div>
    {mode === 'sign-up' && <label className="text-xs text-slate-400">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400" /></label>}
    <label className="text-xs text-slate-400">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400" /></label>
    <label className="text-xs text-slate-400">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400" /></label>
    {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
    <button disabled={pending} className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50">{pending ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
  </form>
}
