'use client'

import { useState } from 'react'
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'set-password'

export function LoginForm({ mode = 'login' }: { mode?: Mode }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(
        err.message.includes('Invalid login')
          ? 'E-mail ou senha incorretos.'
          : err.message
      )
    } else {
      router.push('/palpites')
      router.refresh()
    }
  }

  return (
    <div>
      <div className="md:hidden mb-8">
        <div className="text-[13px] tracking-[.42em] text-[var(--mint)] font-bold uppercase">Copa 2026</div>
        <h1 className="text-5xl font-black leading-[.9] tracking-tight mt-3">
          Bo<span style={{ color: 'var(--score)' }}>lão</span><br />dos amigos
        </h1>
        <p className="text-[var(--muted)] text-sm mt-4 max-w-xs leading-relaxed">
          Um palpite por jogo, escondido até o meio-dia. Sem planilha, sem print no grupo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-[13px] px-4 py-[14px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <Mail size={17} color="var(--muted)" />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com" required autoComplete="email"
            className="flex-1 bg-transparent border-none outline-none text-[var(--chalk)] text-[15px] placeholder-[var(--muted)]"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        <div className="flex items-center gap-3 rounded-[13px] px-4 py-[14px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <Lock size={17} color="var(--muted)" />
          <input
            type={showPw ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha" required autoComplete="current-password"
            className="flex-1 bg-transparent border-none outline-none text-[var(--chalk)] text-[15px] placeholder-[var(--muted)]"
            style={{ fontFamily: 'inherit' }}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-[var(--live)] text-[13px]">{error}</p>}

        <button type="submit" disabled={loading || !email || !password}
          className="w-full rounded-[13px] py-4 text-[15px] font-black tracking-[.02em] transition-all disabled:opacity-60"
          style={{ background: 'var(--score)', color: '#0A130E', boxShadow: '0 14px 30px -12px rgba(255,203,46,.55)', fontFamily: 'inherit' }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="flex items-center gap-2 mt-6 text-[var(--muted)] text-xs">
        <ShieldCheck size={14} />
        Só entra quem foi convidado pelo organizador.
      </div>
    </div>
  )
}
