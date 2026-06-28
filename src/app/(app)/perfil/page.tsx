import { createClient } from '@/lib/supabase/server'
import { AlterarSenhaForm } from './AlterarSenhaForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: participante } = await supabase
    .from('participantes')
    .select('nome, email')
    .eq('id', user!.id)
    .maybeSingle()

  return (
    <div>
      <div className="mb-6">
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Conta</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0' }}>Meu perfil</h1>
      </div>

      {/* Info */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>Nome</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{participante?.nome ?? '—'}</div>
        <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>E-mail</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>{participante?.email ?? user?.email}</div>
      </div>

      {/* Troca de senha */}
      <AlterarSenhaForm />
    </div>
  )
}
