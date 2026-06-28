'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Eye, EyeOff, Lock } from 'lucide-react'

export function AlterarSenhaForm() {
  const [atual,    setAtual]    = useState('')
  const [nova,     setNova]     = useState('')
  const [confirma, setConfirma] = useState('')
  const [showAtual, setShowAtual] = useState(false)
  const [showNova,  setShowNova]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [ok,       setOk]       = useState(false)
  const [erro,     setErro]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (nova.length < 6) { setErro('A nova senha precisa ter pelo menos 6 caracteres.'); return }
    if (nova !== confirma) { setErro('As senhas não coincidem.'); return }

    setLoading(true)
    const supabase = createClient()

    // Re-autentica com a senha atual para confirmar identidade
    const { data: { user } } = await supabase.auth.getUser()
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: atual,
    })
    if (loginErr) {
      setErro('Senha atual incorreta.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: nova })
    setLoading(false)
    if (error) { setErro(error.message); return }

    setOk(true)
    setAtual(''); setNova(''); setConfirma('')
    setTimeout(() => setOk(false), 4000)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', color: 'var(--chalk)',
    border: '1px solid var(--line)', borderRadius: 11, padding: '12px 14px',
    fontSize: 15, fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} color="var(--muted)" />
        <span style={{ fontSize: 15, fontWeight: 800 }}>Alterar senha</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Senha atual */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>
            Senha atual
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showAtual ? 'text' : 'password'}
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
              required
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowAtual(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
              {showAtual ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Nova senha */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>
            Nova senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNova ? 'text' : 'password'}
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowNova(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
              {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirmar */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            required
            placeholder="Repita a nova senha"
            style={inputStyle}
          />
        </div>

        {erro && (
          <div style={{ fontSize: 13, color: 'var(--live)', fontWeight: 600 }}>{erro}</div>
        )}

        {ok && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--mint)', fontWeight: 700 }}>
            <Check size={14} /> Senha alterada com sucesso!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !atual || !nova || !confirma}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 11, fontSize: 15, fontWeight: 800,
            background: 'var(--score)', color: '#0A130E', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', opacity: (loading || !atual || !nova || !confirma) ? 0.5 : 1,
            marginTop: 4,
          }}
        >
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
