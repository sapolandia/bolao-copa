'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Trophy, Lock, Check, ChevronUp, ChevronDown,
  Mail, ShieldCheck, ListChecks, Eye, Star, Settings,
} from 'lucide-react'

// ── dados mockados ──────────────────────────────────────────────────────────

const TIMES: Record<string, { f: string; a: string; n: string }> = {
  BRA: { f: '🇧🇷', a: 'BRA', n: 'Brasil' },
  URU: { f: '🇺🇾', a: 'URU', n: 'Uruguai' },
  FRA: { f: '🇫🇷', a: 'FRA', n: 'França' },
  MAR: { f: '🇲🇦', a: 'MAR', n: 'Marrocos' },
  ESP: { f: '🇪🇸', a: 'ESP', n: 'Espanha' },
  JPN: { f: '🇯🇵', a: 'JPN', n: 'Japão' },
  ARG: { f: '🇦🇷', a: 'ARG', n: 'Argentina' },
  NED: { f: '🇳🇱', a: 'NED', n: 'Holanda' },
  SRB: { f: '🇷🇸', a: 'SRB', n: 'Sérvia' },
}

const JOGOS_HOJE = [
  { id: 'm1', fase: 'oitavas', stage: 'Oitavas de final', kickoff: '13:00', h: 'BRA', a: 'URU' },
  { id: 'm2', fase: 'oitavas', stage: 'Oitavas de final', kickoff: '16:00', h: 'FRA', a: 'MAR' },
  { id: 'm3', fase: 'oitavas', stage: 'Oitavas de final', kickoff: '19:00', h: 'ESP', a: 'JPN' },
]

const ARTILHEIROS = ['Mbappé', 'Vini Jr.', 'Haaland', 'Messi', 'Julián Álvarez', 'Lautaro Martínez', 'Bellingham']

const JOGOS_REVELADOS = [
  {
    id: 'r1', label: 'Brasil x Sérvia', stage: 'Grupo A · máx 3',
    h: 'BRA', a: 'SRB', hs: 2, as: 1, knockout: false,
    rows: [
      { who: 'Você', me: true, g: '2-1', pts: 3 },
      { who: 'Téo', g: '2-1', pts: 3 },
      { who: 'Caio', g: '2-1', pts: 3 },
      { who: 'Marina', g: '3-1', pts: 1 },
      { who: 'Rafa', g: '2-0', pts: 1 },
      { who: 'Bia', g: '1-0', pts: 1 },
      { who: 'Lucas', g: '0-1', pts: 0 },
      { who: 'Duda', g: '1-1', pts: 0 },
    ],
  },
  {
    id: 'r2', label: 'Argentina x Holanda', stage: 'Oitavas · máx 5',
    h: 'ARG', a: 'NED', hs: 1, as: 1, knockout: true, adv: 'ARG (pên.)',
    rows: [
      { who: 'Você', me: true, g: '1-1 → ARG', pts: 5 },
      { who: 'Marina', g: '1-1 → ARG', pts: 5 },
      { who: 'Duda', g: '1-1 → ARG', pts: 5 },
      { who: 'Bia', g: '1-1 → NED', pts: 3 },
      { who: 'Téo', g: '0-0 → ARG', pts: 3 },
      { who: 'Lucas', g: '2-2 → ARG', pts: 3 },
      { who: 'Rafa', g: '2-1 → ARG', pts: 2 },
      { who: 'Caio', g: '3-1 → NED', pts: 0 },
    ],
  },
]

const RANKING = [
  { pos: 1, who: 'Marina', pts: 47, ex: 9, re: 21 },
  { pos: 2, who: 'Você', me: true, pts: 45, ex: 8, re: 22 },
  { pos: 3, who: 'Téo', pts: 43, ex: 8, re: 20 },
  { pos: 4, who: 'Caio', pts: 41, ex: 7, re: 19 },
  { pos: 5, who: 'Bia', pts: 38, ex: 6, re: 18 },
  { pos: 6, who: 'Rafa', pts: 35, ex: 5, re: 17 },
  { pos: 7, who: 'Lucas', pts: 31, ex: 4, re: 16 },
  { pos: 8, who: 'Duda', pts: 28, ex: 3, re: 14 },
]

// ── helpers ─────────────────────────────────────────────────────────────────

function initials(s: string) {
  return s === 'Você' ? 'EU' : s.slice(0, 2).toUpperCase()
}

function fmtTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

// ── componentes base ─────────────────────────────────────────────────────────

function Stepper({ val, set, disabled = false }: { val: number; set: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        className="w-8 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-25"
        style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: disabled ? 'default' : 'pointer' }}
        onMouseEnter={(e) => !disabled && ((e.currentTarget.style.color = 'var(--score)'), (e.currentTarget.style.background = 'rgba(255,203,46,.08)'))}
        onMouseLeave={(e) => ((e.currentTarget.style.color = 'var(--muted)'), (e.currentTarget.style.background = 'transparent'))}
        onClick={() => !disabled && set(Math.min(19, val + 1))}
        disabled={disabled}
        type="button"
      >
        <ChevronUp size={18} />
      </button>
      <span className="font-mono-custom text-[38px] font-bold w-10 text-center leading-tight" style={{ color: 'var(--score)', textShadow: '0 0 16px rgba(255,203,46,.35)' }}>
        {val}
      </span>
      <button
        className="w-8 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-25"
        style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: disabled || val <= 0 ? 'default' : 'pointer' }}
        onMouseEnter={(e) => !disabled && val > 0 && ((e.currentTarget.style.color = 'var(--score)'), (e.currentTarget.style.background = 'rgba(255,203,46,.08)'))}
        onMouseLeave={(e) => ((e.currentTarget.style.color = 'var(--muted)'), (e.currentTarget.style.background = 'transparent'))}
        onClick={() => !disabled && set(Math.max(0, val - 1))}
        disabled={disabled || val <= 0}
        type="button"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  )
}

// ── telas ────────────────────────────────────────────────────────────────────

type Pred = { hs: number; as: number; adv: string | null }

function TelaPalpites() {
  const TRAVA_INICIAL = 2 * 3600 + 14 * 60 + 33
  const [left, setLeft] = useState(TRAVA_INICIAL)
  const [preds, setPreds] = useState<Record<string, Pred>>(
    Object.fromEntries(JOGOS_HOJE.map((m) => [m.id, { hs: 0, as: 0, adv: null }]))
  )
  const [ace, setAce] = useState('')
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState(false)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const i = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(i)
  }, [])

  const travado = left === 0
  const upd = (id: string, key: keyof Pred, val: number | string | null) =>
    setPreds((p) => ({ ...p, [id]: { ...p[id], [key]: val } }))

  function salvar() {
    setSaved(true)
    setToast(true)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(false), 2200)
  }

  return (
    <div className="relative">
      <div className="mb-5">
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Seus palpites</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0' }}>Hoje, 14 de junho</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, maxWidth: '30ch', lineHeight: 1.5 }}>
          Envie antes do primeiro jogo do dia. Depois disso, trava pra todo mundo.
        </p>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 rounded-2xl p-3 mb-4" style={{
        background: 'linear-gradient(180deg, var(--surface2), var(--surface))',
        border: '1px solid var(--line)',
        boxShadow: '0 0 0 1px rgba(255,203,46,.04), 0 14px 30px -22px rgba(255,203,46,.5)',
      }}>
        {travado
          ? <span style={{ fontSize: 20 }}>🔒</span>
          : <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--live)', flexShrink: 0, display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
        }
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            {travado ? 'Palpites travados' : 'Trava em'}
          </div>
          {!travado && (
            <div className="font-mono-custom" style={{ fontSize: 24, fontWeight: 700, color: 'var(--score)', letterSpacing: '.04em', lineHeight: 1, marginTop: 3 }}>
              {fmtTime(left)}
            </div>
          )}
        </div>
      </div>

      {/* Artilheiro */}
      {!ace ? (
        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg,rgba(255,203,46,.1),var(--surface))', border: '1px solid rgba(255,203,46,.28)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Star size={17} color="var(--score)" />
            <span style={{ fontSize: 14, fontWeight: 800 }}>Palpite de artilheiro</span>
            <span className="ml-auto font-mono-custom" style={{ color: 'var(--score)', fontWeight: 700, fontSize: 13 }}>+10 pts</span>
          </div>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && setAce(e.target.value)}
            style={{ width: '100%', background: '#070D09', color: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: 11, padding: '12px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }}
          >
            <option value="" disabled>Escolha o artilheiro da Copa…</option>
            {ARTILHEIROS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg,rgba(255,203,46,.1),var(--surface))', border: '1px solid rgba(255,203,46,.28)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Star size={17} color="var(--score)" />
            <span style={{ fontSize: 14, fontWeight: 800 }}>Palpite de artilheiro</span>
            <span className="ml-auto font-mono-custom" style={{ color: 'var(--score)', fontWeight: 700, fontSize: 13 }}>+10 pts</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
            <Check size={16} color="var(--mint)" />
            Seu palpite: <span style={{ fontWeight: 800, color: 'var(--score)', marginLeft: 4 }}>{ace}</span>
            <span className="ml-auto flex items-center gap-1" style={{ color: 'var(--muted)', fontSize: 11 }}>
              <Lock size={11} /> trancado
            </span>
          </div>
        </div>
      )}

      {/* Jogos */}
      {JOGOS_HOJE.map((m) => {
        const h = TIMES[m.h], a = TIMES[m.a]
        const pred = preds[m.id]
        return (
          <div key={m.id} className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--score)', border: '1px solid rgba(255,203,46,.3)', borderRadius: 999, padding: '3px 9px' }}>
                {m.stage}
              </span>
              <span className="font-mono-custom" style={{ color: 'var(--muted)', fontSize: 13 }}>{m.kickoff}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 6 }}>
              <div className="flex flex-col items-center gap-1.5">
                <span style={{ fontSize: 30, lineHeight: 1 }}>{h.f}</span>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em' }}>{h.a}</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{h.n}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl p-2" style={{ background: '#070D09', border: '1px solid var(--line)', boxShadow: 'inset 0 2px 14px rgba(0,0,0,.6)' }}>
                <Stepper val={pred.hs} set={(v) => upd(m.id, 'hs', v)} disabled={travado} />
                <span className="font-mono-custom" style={{ fontSize: 26, color: 'var(--score-dim)', padding: '0 2px' }}>:</span>
                <Stepper val={pred.as} set={(v) => upd(m.id, 'as', v)} disabled={travado} />
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span style={{ fontSize: 30, lineHeight: 1 }}>{a.f}</span>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em' }}>{a.a}</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{a.n}</span>
              </div>
            </div>

            {/* Quem avança (mata-mata) */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 9 }}>
                <Trophy size={13} /> Quem avança?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ key: 'h', label: `${h.f} ${h.a}` }, { key: 'a', label: `${a.f} ${a.a}` }].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={travado}
                    onClick={() => upd(m.id, 'adv', pred.adv === key ? null : key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      border: `1px solid ${pred.adv === key ? 'var(--score)' : 'var(--line)'}`,
                      background: pred.adv === key ? 'rgba(255,203,46,.13)' : 'var(--surface2)',
                      color: pred.adv === key ? 'var(--score)' : 'var(--chalk)',
                      borderRadius: 11, padding: 11, fontSize: 13, fontWeight: 700, cursor: travado ? 'default' : 'pointer',
                      transition: '.14s', fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <div className="flex gap-2 items-start mb-24 md:mb-6" style={{ color: 'var(--muted)', fontSize: 11.5, lineHeight: 1.5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 13px' }}>
        <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--mint)' }} />
        <span>Ninguém vê o palpite de ninguém até a trava. A regra mora no banco de dados, não só na tela — então não tem como espiar.</span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed flex items-center gap-2 rounded-full font-extrabold animate-rise z-50"
          style={{ left: '50%', transform: 'translateX(-50%)', bottom: 140, background: 'var(--mint)', color: '#06241a', fontSize: 13, padding: '11px 18px', boxShadow: '0 12px 26px -10px rgba(78,217,161,.6)' }}>
          <Check size={15} /> Palpites salvos
        </div>
      )}

      {/* Botão salvar */}
      {!travado && (
        <div className="fixed md:relative bottom-16 md:bottom-0 left-0 right-0 md:mt-4 px-4 md:px-0 pb-3 md:pb-0"
          style={{ background: 'linear-gradient(180deg,transparent,var(--ink) 36%)', paddingTop: 12 }}>
          <button
            onClick={salvar}
            style={{
              width: '100%', maxWidth: 440, display: 'block', margin: '0 auto',
              background: saved ? 'var(--mint)' : 'var(--score)', color: '#0A130E',
              border: 'none', borderRadius: 13, padding: 15, fontFamily: 'inherit',
              fontSize: 15, fontWeight: 900, cursor: 'pointer', letterSpacing: '.02em',
              boxShadow: '0 14px 30px -12px rgba(255,203,46,.55)',
            }}
          >
            {saved ? 'Palpites salvos · editar até a trava' : 'Salvar palpites'}
          </button>
        </div>
      )}
    </div>
  )
}

function TelaRevelados() {
  const [sel, setSel] = useState(JOGOS_REVELADOS[0].id)
  const g = JOGOS_REVELADOS.find((x) => x.id === sel)!
  const h = TIMES[g.h], a = TIMES[g.a]

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          <Eye size={11} /> Palpites revelados
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0' }}>Jogos encerrados</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, maxWidth: '30ch', lineHeight: 1.5 }}>
          Com o jogo no fim, tudo abre e a pontuação é calculada na hora.
        </p>
      </div>

      {/* Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
        {JOGOS_REVELADOS.map((r) => (
          <button key={r.id} onClick={() => setSel(r.id)}
            style={{
              whiteSpace: 'nowrap', border: `1px solid ${r.id === sel ? 'var(--muted)' : 'var(--line)'}`,
              background: r.id === sel ? 'var(--surface2)' : 'var(--surface)',
              color: r.id === sel ? 'var(--chalk)' : 'var(--muted)',
              borderRadius: 999, padding: '8px 13px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: '.14s', fontFamily: 'inherit', flexShrink: 0,
            }}
          >{r.label}</button>
        ))}
      </div>

      {/* Resultado */}
      <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: '.18em', color: 'var(--live)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
          Encerrado · {g.stage}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 30 }}>{h.f}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{h.n}</div>
          </div>
          <div className="font-mono-custom" style={{ fontSize: 34, fontWeight: 700 }}>
            {g.hs}<span style={{ color: 'var(--score-dim)', margin: '0 6px' }}>:</span>{g.as}
          </div>
          <div>
            <div style={{ fontSize: 30 }}>{a.f}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{a.n}</div>
          </div>
        </div>
        {g.knockout && (
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--score)', marginTop: 4 }}>
            Classificado: {g.adv}
          </div>
        )}
      </div>

      {/* Palpites de todos */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        {g.rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3" style={{
            padding: r.me ? '11px 12px' : '11px 16px',
            borderTop: r.me ? 'none' : (i === 0 ? 'none' : '1px solid var(--line)'),
            background: r.me ? 'rgba(255,203,46,.06)' : 'transparent',
            margin: r.me ? '4px -0px' : 0,
            borderRadius: r.me ? 10 : 0,
          }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: 'var(--surface2)', color: 'var(--muted)' }}>
              {initials(r.who)}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{r.who}</span>
            <span className="font-mono-custom" style={{ fontSize: 13, color: 'var(--muted)' }}>{r.g}</span>
            <span className="font-mono-custom" style={{ fontWeight: 700, fontSize: 15, minWidth: 54, textAlign: 'right', color: r.pts === 0 ? 'var(--muted)' : 'var(--mint)' }}>
              {r.pts > 0 ? '+' : ''}{r.pts} pt{r.pts === 1 ? '' : 's'}
            </span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, padding: '12px 16px', borderTop: '1px dashed var(--line)' }}>
          {g.knockout
            ? 'Mata-mata: placar exato +2, resultado certo +1, classificado certo +2. Máximo de 5.'
            : 'Fase de grupos: placar exato vale 3, acertar só o vencedor ou empate vale 1.'}
        </div>
      </div>
    </div>
  )
}

function TelaRanking() {
  const top3 = RANKING.slice(0, 3)
  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          <Trophy size={11} /> Classificação
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0' }}>Bolão dos amigos</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, maxWidth: '30ch', lineHeight: 1.5 }}>
          Campeão é quem somar mais pontos no fim da Copa.
        </p>
      </div>

      {/* Pódio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 8, alignItems: 'end', margin: '10px 0 18px' }}>
        {[top3[1], top3[0], top3[2]].map((p, i) => {
          const isFirst = i === 1
          return (
            <div key={p.who} style={{
              background: isFirst ? 'linear-gradient(180deg,rgba(255,203,46,.12),var(--surface))' : 'var(--surface)',
              border: `1px solid ${isFirst ? 'var(--score)' : 'var(--line)'}`,
              borderRadius: 14, padding: isFirst ? '18px 8px 14px' : '14px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</div>
              <div style={{ fontSize: 13, fontWeight: 800, marginTop: 7 }}>{p.who}</div>
              <div className="font-mono-custom" style={{ color: 'var(--score)', fontWeight: 700, fontSize: 17, marginTop: 3 }}>{p.pts}</div>
            </div>
          )
        })}
      </div>

      {/* Lista */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '4px 16px' }}>
        {RANKING.map((r, i) => (
          <div key={r.pos} className="flex items-center gap-3" style={{
            padding: r.me ? '13px 12px' : '13px 0',
            borderTop: r.me ? 'none' : (i === 0 ? 'none' : '1px solid var(--line)'),
            background: r.me ? 'rgba(255,203,46,.07)' : 'transparent',
            margin: r.me ? '4px -16px' : 0,
            borderRadius: r.me ? 11 : 0,
          }}>
            <span className="font-mono-custom" style={{ fontSize: 14, color: 'var(--muted)', width: 22 }}>{r.pos}º</span>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: 'var(--surface2)', color: 'var(--muted)' }}>
              {initials(r.who)}
            </span>
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{r.who}</span>
            <span className="font-mono-custom" style={{ fontSize: 10.5, color: 'var(--muted)', textAlign: 'right', lineHeight: 1.5 }}>
              {r.ex} exatos<br />{r.re} result.
            </span>
            <span className="font-mono-custom" style={{ fontWeight: 700, fontSize: 18, color: 'var(--score)', minWidth: 42, textAlign: 'right' }}>
              {r.pts}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start mt-3" style={{ color: 'var(--muted)', fontSize: 11.5, lineHeight: 1.5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 13px' }}>
        <ListChecks size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--mint)' }} />
        <span>Empate? Desempata por mais placares exatos, depois mais acertos de resultado. Persistindo, o prêmio é dividido.</span>
      </div>
    </div>
  )
}

function TelaLogin({ onEnter }: { onEnter: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 26px 80px' }}>
      <div style={{ fontSize: 13, letterSpacing: '.42em', color: 'var(--mint)', fontWeight: 700, textTransform: 'uppercase' }}>Copa 2026</div>
      <h1 style={{ fontSize: 54, fontWeight: 900, letterSpacing: '-.02em', lineHeight: .92, margin: '14px 0 6px' }}>
        Bo<span style={{ color: 'var(--score)' }}>lão</span><br />dos amigos
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5, marginBottom: 34, maxWidth: '30ch' }}>
        Um palpite por jogo, escondido até a trava. Sem planilha, sem print no grupo.
      </p>

      {!sent ? (
        <>
          <div className="flex items-center gap-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '14px 15px', marginBottom: 12 }}>
            <Mail size={17} color="var(--muted)" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              type="email"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--chalk)', fontFamily: 'inherit', fontSize: 15 }}
            />
          </div>
          <button
            onClick={() => email && setSent(true)}
            style={{ width: '100%', background: 'var(--score)', color: '#0A130E', border: 'none', borderRadius: 13, padding: 15, fontFamily: 'inherit', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}
          >
            Enviar link mágico
          </button>
        </>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(78,217,161,.3)', borderRadius: 14, padding: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(78,217,161,.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint)', marginBottom: 13 }}>
            <Mail size={20} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 7px' }}>Confira seu e-mail</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
            Mandamos um link de acesso para <strong style={{ color: 'var(--chalk)' }}>{email}</strong>. Toque nele para entrar — sem senha.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-8" style={{ color: 'var(--muted)', fontSize: 12 }}>
        <ShieldCheck size={14} color="var(--muted)" /> Só entra quem foi convidado pelo organizador.
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button
          onClick={onEnter}
          style={{ background: 'none', border: 'none', color: 'var(--score)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          Entrar no demo →
        </button>
      </div>
    </div>
  )
}

// ── shell principal ───────────────────────────────────────────────────────────

type Tela = 'login' | 'palpites' | 'revelados' | 'ranking'

export function DemoApp() {
  const [tela, setTela] = useState<Tela>('login')
  const [tab, setTab] = useState<'palpites' | 'revelados' | 'ranking'>('palpites')

  const TABS = [
    { id: 'palpites', label: 'Palpites', icon: ListChecks },
    { id: 'revelados', label: 'Revelados', icon: Eye },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ] as const

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0 40px' }}>
      {/* Badge demo */}
      <div className="flex items-center gap-2 mb-4 rounded-full px-4 py-1.5" style={{ background: 'rgba(255,203,46,.12)', border: '1px solid rgba(255,203,46,.3)', fontSize: 12, fontWeight: 700, color: 'var(--score)' }}>
        <Settings size={13} />
        Modo demo — dados fictícios, sem Supabase
      </div>

      {/* Container: mobile estreito em desktop */}
      <div style={{
        width: '100%', maxWidth: 440,
        minHeight: 'calc(100vh - 120px)',
        display: 'flex', flexDirection: 'column', position: 'relative',
        border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden',
        background: 'var(--ink)',
      }}>
        {tela === 'login' ? (
          <TelaLogin onEnter={() => { setTela('app' as unknown as Tela); setTab('palpites') }} />
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 120px' }}>
              {tab === 'palpites' && <TelaPalpites />}
              {tab === 'revelados' && <TelaRevelados />}
              {tab === 'ranking' && <TelaRanking />}
            </div>

            {/* TabBar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex', background: 'rgba(10,19,14,.92)',
              backdropFilter: 'blur(10px)', borderTop: '1px solid var(--line)',
            }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    color: tab === id ? 'var(--score)' : 'var(--muted)',
                    cursor: 'pointer', padding: '11px 0 13px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontFamily: 'inherit', fontSize: 10.5, fontWeight: 700, transition: '.14s',
                  }}>
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-center" style={{ color: 'var(--muted)', fontSize: 12 }}>
        A versão real usa Supabase — configure <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> para ativar auth e banco.
      </p>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,90,77,.55); }
          70% { box-shadow: 0 0 0 8px rgba(255,90,77,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,90,77,0); }
        }
        @keyframes rise {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-rise { animation: rise .3s ease; }
      `}</style>
    </div>
  )
}
