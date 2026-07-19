'use client'

import { useState } from 'react'
import { RefreshCw, Zap, ListOrdered, UserPlus, Send, MessageCircle } from 'lucide-react'
import type { Jogo } from '@/types'

interface Participante { id: string; nome: string; email: string; telefone: string | null }

interface Props {
  jogos: Jogo[]
  participantes: Participante[]
}

function faseLabel(fase: string): string {
  const map: Record<string, string> = {
    grupos: 'Grupo', oitavas: 'Oitavas', quartas: 'Quartas',
    semi: 'Semi', terceiro: '3º lugar', final: 'Final',
  }
  return map[fase] ?? fase
}

export function AdminPanel({ jogos, participantes: inicial }: Props) {
  const [tab, setTab]     = useState<'convites' | 'jogos' | 'api' | 'whatsapp'>('convites')
  const [syncing, setSyncing]   = useState<string | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [resultado, setResultado] = useState({ pm: 0, pv: 0 })
  const [msg, setMsg]     = useState('')
  const [lista, setLista] = useState(inicial)

  // Convite
  const [invNome, setInvNome]       = useState('')
  const [invEmail, setInvEmail]     = useState('')
  const [invTel, setInvTel]         = useState('')
  const [invLoading, setInvLoading] = useState(false)

  function showMsg(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  async function convidar() {
    if (!invEmail || !invNome) return
    setInvLoading(true)
    const res  = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invEmail, nome: invNome, telefone: invTel || undefined }),
    })
    const data = await res.json()
    setInvLoading(false)
    if (data.error) { showMsg('Erro: ' + data.error); return }
    showMsg(`✓ Convite enviado para ${invEmail}`)
    setInvNome(''); setInvEmail(''); setInvTel('')
  }

  async function syncAPI(endpoint: string, label: string) {
    setSyncing(label)
    const res  = await fetch(`/api/sync/${endpoint}`, { method: 'POST' })
    const data = await res.json()
    setSyncing(null)
    showMsg(data.error ? 'Erro: ' + data.error : `✓ ${label}: ${JSON.stringify(data)}`)
  }

  async function salvarResultado(jogo: Jogo) {
    const res  = await fetch('/api/admin/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jogoId: jogo.id, pm: resultado.pm, pv: resultado.pv }),
    })
    const data = await res.json()
    if (data.error) { showMsg('Erro: ' + data.error); return }
    showMsg('✓ Resultado salvo!')
    setEditando(null)
  }

  async function enviarLembrete() {
    setSyncing('lembrete')
    const res  = await fetch('/api/whatsapp/lembrete', { method: 'POST' })
    const data = await res.json()
    setSyncing(null)
    showMsg(data.error ? 'Erro: ' + data.error : `✓ Lembrete enviado para ${data.pendentes ?? 0} pessoas`)
  }

  const TABS = [
    { id: 'convites',  label: 'Convidar', icon: UserPlus },
    { id: 'jogos',     label: 'Jogos',    icon: ListOrdered },
    { id: 'api',       label: 'API',      icon: RefreshCw },
    { id: 'whatsapp',  label: 'WhatsApp', icon: MessageCircle },
  ] as const

  return (
    <div>
      <div className="mb-5">
        <div className="text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">Área restrita</div>
        <h1 className="text-[24px] font-black mt-1">Painel admin</h1>
      </div>

      {msg && (
        <div className="rounded-xl p-3 mb-4 text-sm font-bold"
          style={{ background: msg.startsWith('Erro') ? 'rgba(255,90,77,.1)' : 'rgba(78,217,161,.13)', color: msg.startsWith('Erro') ? 'var(--live)' : 'var(--mint)', border: `1px solid ${msg.startsWith('Erro') ? 'rgba(255,90,77,.3)' : 'rgba(78,217,161,.3)'}` }}>
          {msg}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{ background: tab === id ? 'var(--surface2)' : 'var(--surface)', border: `1px solid ${tab === id ? 'var(--muted)' : 'var(--line)'}`, color: tab === id ? 'var(--chalk)' : 'var(--muted)', fontFamily: 'inherit', cursor: 'pointer' }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Convidar ── */}
      {tab === 'convites' && (
        <div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Adicione cada participante aqui. Eles receberão um e-mail para criar a senha e acessar o bolão.
          </p>

          <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <h3 className="text-sm font-extrabold">Novo convidado</h3>
            {[
              { placeholder: 'Nome completo', value: invNome, set: setInvNome, type: 'text' },
              { placeholder: 'E-mail', value: invEmail, set: setInvEmail, type: 'email' },
              { placeholder: 'WhatsApp (ex: 5511999999999)', value: invTel, set: setInvTel, type: 'tel' },
            ].map(({ placeholder, value, set, type }) => (
              <input key={placeholder} type={type} placeholder={placeholder} value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: '#070D09', border: '1px solid var(--line)', color: 'var(--chalk)', fontFamily: 'inherit' }}
              />
            ))}
            <button onClick={convidar} disabled={invLoading || !invEmail || !invNome}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: 'var(--score)', color: '#0A130E', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <Send size={14} /> {invLoading ? 'Enviando…' : 'Enviar convite por e-mail'}
            </button>
          </div>

          {/* Lista de participantes */}
          <div className="text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold mb-3">
            Participantes ({lista.length}/13)
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            {lista.length === 0 ? (
              <div className="p-6 text-center text-[var(--muted)] text-sm">Nenhum participante ainda.</div>
            ) : lista.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--line)]' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-none"
                  style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {p.nome.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.nome}</div>
                  <div className="text-xs text-[var(--muted)] truncate">{p.email}</div>
                </div>
                {p.telefone
                  ? <span className="text-[10px] text-[var(--mint)] font-bold">📱 WA</span>
                  : <span className="text-[10px] text-[var(--muted)]">sem WA</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Jogos ── */}
      {tab === 'jogos' && (
        <div className="flex flex-col gap-3">
          {jogos.length === 0 ? (
            <div className="rounded-2xl p-6 text-center text-[var(--muted)] text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              Nenhum jogo. Rode "Sincronizar jogos de hoje" na aba API.
            </div>
          ) : jogos.map((j) => {
            const isEdit = editando === j.id
            const kickoff = new Date(j.kickoff_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
            return (
              <div key={j.id} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-sm font-extrabold">{j.mandante} x {j.visitante}</span>
                  <span className="text-xs text-[var(--muted)]">{faseLabel(j.fase)} · {kickoff}</span>
                </div>
                {j.status === 'encerrado' && !isEdit && (
                  <div className="text-sm font-bold mb-2" style={{ color: 'var(--mint)' }}>
                    Resultado: {j.placar_mandante} x {j.placar_visitante}
                  </div>
                )}
                {isEdit ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={30} value={resultado.pm}
                        onChange={(e) => setResultado((r) => ({ ...r, pm: +e.target.value }))}
                        className="w-16 p-2 text-center rounded-lg text-sm font-bold"
                        style={{ background: '#070D09', border: '1px solid var(--line)', color: 'var(--chalk)', fontFamily: 'inherit' }}
                      />
                      <span className="text-[var(--muted)]">x</span>
                      <input type="number" min={0} max={30} value={resultado.pv}
                        onChange={(e) => setResultado((r) => ({ ...r, pv: +e.target.value }))}
                        className="w-16 p-2 text-center rounded-lg text-sm font-bold"
                        style={{ background: '#070D09', border: '1px solid var(--line)', color: 'var(--chalk)', fontFamily: 'inherit' }}
                      />
                      <span className="text-xs text-[var(--muted)]">tempo regulamentar</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => salvarResultado(j)}
                        style={{ background: 'var(--score)', color: '#0A130E', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Salvar
                      </button>
                      <button onClick={() => setEditando(null)}
                        style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setEditando(j.id); setResultado({ pm: j.placar_mandante ?? 0, pv: j.placar_visitante ?? 0 }) }}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--muted)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {j.status === 'encerrado' ? 'Corrigir' : 'Lançar resultado'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── API ── */}
      {tab === 'api' && (
        <div className="flex flex-col gap-3">
          {[
            { key: 'fixtures', label: 'Sincronizar jogos de hoje',  icon: ListOrdered, desc: 'Importa/atualiza somente os jogos de hoje no banco.' },
            { key: 'results',  label: 'Atualizar resultados',       icon: RefreshCw,   desc: 'Busca placares encerrados (ontem/hoje/amanhã).' },
            { key: 'live',     label: 'Encerrar jogos ao vivo',     icon: Zap,         desc: 'Finaliza jogos com FT/AET/PEN.' },
          ].map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                    <Icon size={14} style={{ color: 'var(--mint)' }} /> {label}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{desc}</p>
                </div>
                <button onClick={() => syncAPI(key, label)} disabled={syncing !== null}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-1.5"
                  style={{ background: 'var(--score)', color: '#0A130E', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <RefreshCw size={13} /> Rodar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WhatsApp ── */}
      {tab === 'whatsapp' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--muted)]">
            Lembrete enviado automaticamente às <strong className="text-[var(--chalk)]">11h30</strong> para quem ainda não enviou os palpites do dia. Você também pode disparar manualmente.
          </p>

          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                  <MessageCircle size={14} style={{ color: 'var(--mint)' }} /> Enviar lembrete agora
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Mensagem enviada apenas para quem ainda não enviou palpites de hoje e tem WhatsApp cadastrado.
                </p>
              </div>
              <button onClick={enviarLembrete} disabled={syncing !== null}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: 'var(--mint)', color: '#06241a', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                <Send size={13} /> Enviar
              </button>
            </div>
          </div>

          <div className="rounded-xl p-3 text-xs text-[var(--muted)]" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <strong className="text-[var(--chalk)]">Participantes com WhatsApp:</strong><br />
            {lista.filter((p) => p.telefone).map((p) => p.nome).join(', ') || 'Nenhum ainda — adicione o número no cadastro.'}
          </div>
        </div>
      )}
    </div>
  )
}
