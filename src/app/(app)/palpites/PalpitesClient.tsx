'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Check, Trophy, Lock, ShieldCheck, Loader } from 'lucide-react'
import { Stepper } from '@/components/Stepper'
import { Countdown } from '@/components/Countdown'
import { createClient } from '@/lib/supabase/client'
import type { Jogo, Palpite } from '@/types'

function TeamCol({ nome, logo }: { nome: string; logo: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {logo ? (
        <Image src={logo} alt={nome} width={40} height={40} style={{ objectFit: 'contain' }} />
      ) : (
        <div style={{ width: 40, height: 40 }} />
      )}
      <span style={{ fontSize: 12, fontWeight: 800, textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>{nome}</span>
    </div>
  )
}

const TIMES_COPA = [
  'Algeria','Argentina','Australia','Austria','Belgium','Bosnia & Herzegovina',
  'Brazil','Canada','Cape Verde Islands','Colombia','Congo DR','Croatia','Curaçao',
  'Czechia','Ecuador','Egypt','England','France','Germany','Ghana','Haiti','Iran',
  'Iraq','Ivory Coast','Japan','Jordan','Mexico','Morocco','Netherlands','New Zealand',
  'Norway','Panama','Paraguay','Portugal','Qatar','Saudi Arabia','Scotland','Senegal',
  'South Africa','South Korea','Spain','Sweden','Switzerland','Tunisia','Türkiye',
  'USA','Uruguay','Uzbekistan',
]

type CardStatus = 'saved' | 'dirty' | 'saving' | 'error'

interface Props {
  jogos: Jogo[]
  palpitesIniciais: Palpite[]
  campeaoInicial: string | null
  campeaoBloqueado: boolean
  trava: string
  travado: boolean
  userId: string
  isPrimeiroAcesso: boolean
}

type PalpiteLocal = { hs: number; as: number }

export function PalpitesClient({
  jogos, palpitesIniciais, campeaoInicial, campeaoBloqueado,
  trava, travado, userId, isPrimeiroAcesso,
}: Props) {
  // Palpites existentes no banco (por jogo_id)
  const savedSet = new Set(palpitesIniciais.map((p) => p.jogo_id))

  const buildInicial = () => {
    const map: Record<string, PalpiteLocal> = {}
    for (const j of jogos) {
      const p = palpitesIniciais.find((x) => x.jogo_id === j.id)
      map[j.id] = { hs: p?.placar_mandante ?? 0, as: p?.placar_visitante ?? 0 }
    }
    return map
  }

  const buildStatus = (): Record<string, CardStatus> => {
    const map: Record<string, CardStatus> = {}
    for (const j of jogos) {
      map[j.id] = savedSet.has(j.id) ? 'saved' : 'dirty'
    }
    return map
  }

  const [preds, setPreds]       = useState<Record<string, PalpiteLocal>>(buildInicial)
  const [status, setStatus]     = useState<Record<string, CardStatus>>(buildStatus)
  const [campeao, setCampeao]   = useState(campeaoInicial)
  const debounces = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const saveCard = useCallback(async (jogoId: string, pred: PalpiteLocal) => {
    setStatus((s) => ({ ...s, [jogoId]: 'saving' }))
    const supabase = createClient()
    const { error } = await supabase.from('palpites').upsert({
      participante_id:  userId,
      jogo_id:          jogoId,
      placar_mandante:  pred.hs,
      placar_visitante: pred.as,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'participante_id,jogo_id' })

    setStatus((s) => ({ ...s, [jogoId]: error ? 'error' : 'saved' }))
  }, [userId])

  const upd = (jogoId: string, key: keyof PalpiteLocal, val: number) => {
    const next = { ...preds[jogoId], [key]: val }
    setPreds((p) => ({ ...p, [jogoId]: next }))
    setStatus((s) => ({ ...s, [jogoId]: 'dirty' }))

    // Debounce auto-save: 900ms após parar de mexer
    if (debounces.current[jogoId]) clearTimeout(debounces.current[jogoId])
    debounces.current[jogoId] = setTimeout(() => saveCard(jogoId, next), 900)
  }

  async function handleCampeao(time: string) {
    if (campeaoBloqueado) return
    setCampeao(time)
    const supabase = createClient()
    await supabase.from('palpite_campeao').upsert(
      { participante_id: userId, time_campeao: time },
      { onConflict: 'participante_id' }
    )
  }

  const allSaved = Object.values(status).every((s) => s === 'saved')
  const anyDirty = Object.values(status).some((s) => s === 'dirty' || s === 'saving')

  const travaDate = new Date(trava)
  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo',
  })

  return (
    <div className="relative">
      <div className="mb-5">
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          Seus palpites
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0', textTransform: 'capitalize' }}>{hoje}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, maxWidth: '32ch', lineHeight: 1.5 }}>
          Palpites aceitos até <strong style={{ color: 'var(--chalk)' }}>12h00</strong> (meio-dia, horário de Brasília).
        </p>
      </div>

      <Countdown trava={travaDate} />

      {/* Campeão da Copa */}
      {!campeaoBloqueado && (
        <div className="rounded-2xl p-4 mb-3" style={{
          background: 'linear-gradient(135deg,rgba(255,203,46,.1),var(--surface))',
          border: '1px solid rgba(255,203,46,.28)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={17} color="var(--score)" />
            <span style={{ fontSize: 14, fontWeight: 800 }}>
              {isPrimeiroAcesso ? 'Palpite de campeão da Copa 🏆' : 'Seu palpite de campeão'}
            </span>
            <span className="ml-auto font-mono-custom" style={{ color: 'var(--score)', fontWeight: 700, fontSize: 13 }}>+10 pts</span>
          </div>

          {!campeao ? (
            <>
              {isPrimeiroAcesso && (
                <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                  No seu primeiro acesso, além dos jogos do dia, escolha quem será o campeão da Copa. Só pode mudar até o início do torneio.
                </p>
              )}
              <select
                defaultValue=""
                onChange={(e) => e.target.value && handleCampeao(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', color: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: 11, padding: 12, fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }}
              >
                <option value="" disabled>Escolha o campeão da Copa…</option>
                {TIMES_COPA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          ) : (
            <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
              <Check size={16} color="var(--mint)" />
              Seu palpite: <strong style={{ color: 'var(--score)', marginLeft: 4 }}>{campeao}</strong>
              <span className="ml-auto">
                <button
                  onClick={() => setCampeao(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  trocar
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {campeaoBloqueado && campeao && (
        <div className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
        }}>
          <Trophy size={16} color="var(--score)" />
          <span style={{ fontSize: 13, flex: 1 }}>Campeão: <strong style={{ color: 'var(--score)' }}>{campeao}</strong></span>
          <span className="flex items-center gap-1" style={{ color: 'var(--muted)', fontSize: 11 }}>
            <Lock size={11} /> trancado
          </span>
        </div>
      )}

      {/* Jogos */}
      {jogos.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
          Nenhum jogo hoje.
        </div>
      ) : jogos.map((jogo) => {
        const pred    = preds[jogo.id]
        const st      = status[jogo.id]
        const kickoff = new Date(jogo.kickoff_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
        })

        return (
          <div key={jogo.id} className="rounded-2xl p-4 mb-3" style={{
            background: 'var(--surface)',
            border: `1px solid ${st === 'saved' ? 'var(--mint)' : st === 'error' ? 'var(--live)' : 'var(--line)'}`,
            transition: 'border-color .25s',
          }}>
            {/* Card header */}
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '3px 9px' }}>
                {faseLabel(jogo.fase)}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-mono-custom" style={{ color: 'var(--muted)', fontSize: 13 }}>{kickoff}</span>
                <StatusBadge st={st} travado={travado} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 6 }}>
              <TeamCol nome={jogo.mandante} logo={jogo.logo_mandante} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 10px', boxShadow: 'inset 0 2px 14px rgba(0,0,0,.6)' }}>
                <Stepper val={pred.hs} set={(v) => upd(jogo.id, 'hs', v)} disabled={travado} />
                <span className="font-mono-custom" style={{ fontSize: 26, color: 'var(--score-dim)', padding: '0 2px' }}>:</span>
                <Stepper val={pred.as} set={(v) => upd(jogo.id, 'as', v)} disabled={travado} />
              </div>

              <TeamCol nome={jogo.visitante} logo={jogo.logo_visitante} />
            </div>
          </div>
        )
      })}

      {/* Banner quando tudo salvo */}
      {!travado && jogos.length > 0 && allSaved && (
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(78,217,161,.08)', border: '1px solid rgba(78,217,161,.3)' }}>
          <Check size={18} color="var(--mint)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--mint)' }}>Todos os palpites salvos</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Você pode ajustar até as 12h00. Alterações salvam automaticamente.</div>
          </div>
        </div>
      )}

      {/* Banner palpites travados */}
      {travado && (
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <Lock size={16} color="var(--muted)" />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Palpites encerrados para hoje.</span>
        </div>
      )}

      <div className="flex gap-2 items-start mb-24 md:mb-6" style={{ color: 'var(--muted)', fontSize: 11.5, lineHeight: 1.5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 13px' }}>
        <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--mint)' }} />
        <span>Ninguém vê o palpite de ninguém até o meio-dia. A regra mora no banco de dados — não tem como espiar.</span>
      </div>

      {/* Botão salvar (só aparece se tiver algo pendente) */}
      {!travado && jogos.length > 0 && anyDirty && (
        <div className="fixed md:relative bottom-16 md:bottom-0 left-0 right-0 md:mt-4 px-4 md:px-0 pb-3 md:pb-0"
          style={{ background: 'linear-gradient(180deg,transparent,var(--ink) 36%)', paddingTop: 12 }}>
          <button
            onClick={() => {
              jogos.forEach((j) => {
                if (status[j.id] !== 'saved') saveCard(j.id, preds[j.id])
              })
            }}
            className="w-full md:max-w-sm rounded-[13px] py-4 text-[15px] font-black tracking-[.02em] transition-all"
            style={{ background: 'var(--score)', color: '#0A130E', boxShadow: '0 14px 30px -12px rgba(255,203,46,.55)', fontFamily: 'inherit', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto' }}>
            Salvar palpites pendentes
          </button>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ st, travado }: { st: CardStatus; travado: boolean }) {
  if (travado) return null
  if (st === 'saving') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted)' }}>
      <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> salvando
    </span>
  )
  if (st === 'saved') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--mint)', fontWeight: 700 }}>
      <Check size={11} /> salvo
    </span>
  )
  if (st === 'error') return (
    <span style={{ fontSize: 10, color: 'var(--live)', fontWeight: 700 }}>erro ao salvar</span>
  )
  // dirty — não salvo ainda
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--score)', fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--score)', display: 'inline-block' }} />
      não salvo
    </span>
  )
}

function faseLabel(fase: string): string {
  const map: Record<string, string> = {
    grupos: 'Grupos',
    oitavas: 'Oitavas',
    quartas: 'Quartas',
    semi: 'Semi',
    terceiro: '3º lugar',
    final: 'Final',
  }
  return map[fase] ?? fase
}
