'use client'

import { useState, useEffect, Suspense } from 'react'
import { Lock, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function ConviteForm() {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Supabase redireciona para /convite#access_token=... ou ?code=...
    // O cliente SSR já processa o hash/code automaticamente
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      setError('Não foi possível definir a senha. O link pode ter expirado.')
    } else {
      setDone(true)
      setTimeout(() => router.push('/palpites'), 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-[13px] tracking-[.42em] text-[var(--mint)] font-bold uppercase mb-2">Copa 2026</div>
        <h1 className="text-4xl font-black leading-tight mb-2">
          Bem-vindo ao<br /><span style={{ color: 'var(--score)' }}>Bolão!</span>
        </h1>
        <p className="text-[var(--muted)] text-sm mb-8 leading-relaxed">
          Escolha uma senha para acessar sempre que quiser.
        </p>

        {done ? (
          <div className="flex items-center gap-3 rounded-2xl p-5"
            style={{ background: 'rgba(78,217,161,.1)', border: '1px solid rgba(78,217,161,.3)' }}>
            <Check size={20} color="var(--mint)" />
            <span className="font-bold text-[var(--mint)]">Senha definida! Entrando…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-[13px] px-4 py-[14px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <Lock size={17} color="var(--muted)" />
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie sua senha (mín. 8 caracteres)"
                required autoComplete="new-password"
                className="flex-1 bg-transparent border-none outline-none text-[var(--chalk)] text-[15px] placeholder-[var(--muted)]"
                style={{ fontFamily: 'inherit' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-[var(--live)] text-[13px]">{error}</p>}

            <button type="submit" disabled={loading || password.length < 8}
              className="w-full rounded-[13px] py-4 text-[15px] font-black disabled:opacity-60"
              style={{ background: 'var(--score)', color: '#0A130E', fontFamily: 'inherit', border: 'none', cursor: 'pointer', boxShadow: '0 14px 30px -12px rgba(255,203,46,.55)' }}>
              {loading ? 'Salvando…' : 'Definir senha e entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ConvitePage() {
  return (
    <Suspense>
      <ConviteForm />
    </Suspense>
  )
}
