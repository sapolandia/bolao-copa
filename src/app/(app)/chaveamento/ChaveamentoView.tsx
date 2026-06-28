'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Jogo {
  id: number
  mandante: string
  visitante: string
  logo_mandante: string
  logo_visitante: string
  gols_mandante: number | null
  gols_visitante: number | null
  data: string
  ao_vivo: boolean
  elapsed: number | null
  encerrado: boolean
}

interface Fase { label: string; jogos: Jogo[] }

// ─── Desktop bracket constants ────────────────────────────────
const CW   = 156
const CH   = 50
const SLOT = 76
const GAP  = 28
const COL  = CW + GAP
const SIDES  = 4
const BH     = 8 * SLOT
const FINAL_X = SIDES * COL
const BW     = 2 * SIDES * COL + CW

function cy(r: number, i: number) { return i * Math.pow(2, r) * SLOT + Math.pow(2, r) * SLOT / 2 }
function lx(r: number) { return r * COL }
function rx(r: number) { return BW - r * COL - CW }

const LINE = 'rgba(160,120,50,.5)'

function buildPaths(side: 'left' | 'right'): string[] {
  const paths: string[] = []
  for (let r = 0; r < SIDES - 1; r++) {
    const pairs = Math.pow(2, SIDES - 1 - r) / 2
    for (let i = 0; i < pairs; i++) {
      const y1 = cy(r, 2 * i), y2 = cy(r, 2 * i + 1), yn = cy(r + 1, i)
      if (side === 'left') {
        const xe = lx(r) + CW, xm = xe + GAP / 2, xn = lx(r + 1)
        paths.push(`M${xe},${y1} H${xm}`, `M${xe},${y2} H${xm}`, `M${xm},${y1} V${y2}`, `M${xm},${yn} H${xn}`)
      } else {
        const xe = rx(r), xm = xe - GAP / 2, xn = rx(r + 1) + CW
        paths.push(`M${xe},${y1} H${xm}`, `M${xe},${y2} H${xm}`, `M${xm},${y1} V${y2}`, `M${xm},${yn} H${xn}`)
      }
    }
  }
  const yn = cy(SIDES - 1, 0)
  if (side === 'left') paths.push(`M${lx(SIDES - 1) + CW},${yn} H${FINAL_X}`)
  else                  paths.push(`M${rx(SIDES - 1)},${yn} H${FINAL_X + CW}`)
  return paths
}

// ─── Shared team row ─────────────────────────────────────────
function TeamRow({ nome, logo, gols, win, lost }: {
  nome: string; logo: string | null; gols: number | null; win: boolean; lost: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 6px', height: '100%', minWidth: 0 }}>
      {logo
        ? <Image src={logo} alt={nome} width={16} height={16} style={{ objectFit: 'contain', flexShrink: 0 }} />
        : <div style={{ width: 16, height: 16, borderRadius: 2, background: 'var(--line)', flexShrink: 0 }} />}
      <span style={{
        flex: 1, fontSize: 10, fontWeight: win ? 700 : 400,
        color: win ? 'var(--chalk)' : lost ? 'var(--muted)' : 'var(--chalk)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{nome}</span>
      {gols !== null && (
        <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "'Space Mono', monospace", color: win ? 'var(--score)' : 'var(--muted)' }}>{gols}</span>
      )}
    </div>
  )
}

// ─── Card used in desktop bracket ────────────────────────────
function isHoje(dateStr: string): boolean {
  const d = new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const n = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  return d === n
}

function BracketCard({ jogo, x, y, isFinal }: { jogo: Jogo | null; x: number; y: number; isFinal?: boolean }) {
  const w = isFinal ? CW + 20 : CW
  const h = isFinal ? CH + 8  : CH
  const winH = !!(jogo?.encerrado && jogo.gols_mandante! > jogo.gols_visitante!)
  const winA = !!(jogo?.encerrado && jogo.gols_visitante! > jogo.gols_mandante!)
  const hoje = !!(jogo && !jogo.encerrado && !jogo.ao_vivo && isHoje(jogo.data))
  return (
    <div style={{
      position: 'absolute', left: x, top: y - h / 2, width: w, height: h,
      background: hoje ? 'rgba(78,217,161,.06)' : 'var(--surface)',
      border: `1px solid ${jogo?.ao_vivo ? 'var(--live)' : isFinal ? 'rgba(255,203,46,.45)' : hoje ? 'var(--mint)' : 'var(--line)'}`,
      borderRadius: 8, overflow: 'hidden',
      boxShadow: jogo?.ao_vivo ? '0 0 12px rgba(255,90,77,.3)' : isFinal ? '0 0 0 1px rgba(255,203,46,.12)' : hoje ? '0 0 10px rgba(78,217,161,.15)' : 'none',
    }}>
      {jogo ? (
        <>
          <div style={{ height: '50%', borderBottom: '1px solid var(--line)' }}>
            <TeamRow nome={jogo.mandante} logo={jogo.logo_mandante} gols={jogo.gols_mandante} win={winH} lost={winA} />
          </div>
          <div style={{ height: '50%' }}>
            <TeamRow nome={jogo.visitante} logo={jogo.logo_visitante} gols={jogo.gols_visitante} win={winA} lost={winH} />
          </div>
        </>
      ) : (
        <>
          <div style={{ height: '50%', borderBottom: '1px solid var(--line)' }}>
            <TeamRow nome="A definir" logo={null} gols={null} win={false} lost={false} />
          </div>
          <div style={{ height: '50%' }}>
            <TeamRow nome="A definir" logo={null} gols={null} win={false} lost={false} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Mobile: card de jogo completo ───────────────────────────
function MobileMatchCard({ jogo }: { jogo: Jogo | null }) {
  if (!jogo) return (
    <div style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 12, padding: '14px 16px', opacity: 0.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--line)' }} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>A definir</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--line)' }} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>A definir</span>
      </div>
    </div>
  )

  const winH = jogo.encerrado && jogo.gols_mandante! > jogo.gols_visitante!
  const winA = jogo.encerrado && jogo.gols_visitante! > jogo.gols_mandante!
  const hoje = !jogo.encerrado && !jogo.ao_vivo && isHoje(jogo.data)
  const hora = new Date(jogo.data).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  })

  return (
    <div style={{
      background: hoje ? 'rgba(78,217,161,.06)' : 'var(--surface)',
      border: `1px solid ${jogo.ao_vivo ? 'var(--live)' : hoje ? 'var(--mint)' : 'var(--line)'}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: jogo.ao_vivo ? '0 0 12px rgba(255,90,77,.2)' : hoje ? '0 0 10px rgba(78,217,161,.15)' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 0' }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{hora}</span>
        {jogo.ao_vivo && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#ff5a4d', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5a4d', display: 'inline-block' }} />
            {jogo.elapsed}&apos;
          </span>
        )}
        {jogo.encerrado && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em' }}>ENCERRADO</span>}
      </div>

      {/* Times */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '10px 14px 14px' }}>
        {/* Mandante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {jogo.logo_mandante
            ? <Image src={jogo.logo_mandante} alt={jogo.mandante} width={36} height={36} style={{ objectFit: 'contain' }} />
            : <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--line)' }} />}
          <span style={{ fontSize: 11, fontWeight: winH ? 800 : 500, textAlign: 'center', color: winH ? 'var(--chalk)' : winA ? 'var(--muted)' : 'var(--chalk)', lineHeight: 1.3, maxWidth: 80 }}>
            {jogo.mandante}
          </span>
        </div>

        {/* Placar */}
        <div style={{ textAlign: 'center' }}>
          {(jogo.gols_mandante !== null) ? (
            <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Mono', monospace", color: 'var(--chalk)' }}>
              {jogo.gols_mandante}<span style={{ color: 'var(--muted)', margin: '0 3px' }}>:</span>{jogo.gols_visitante}
            </span>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: 'var(--muted)' }}>vs</span>
          )}
        </div>

        {/* Visitante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {jogo.logo_visitante
            ? <Image src={jogo.logo_visitante} alt={jogo.visitante} width={36} height={36} style={{ objectFit: 'contain' }} />
            : <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--line)' }} />}
          <span style={{ fontSize: 11, fontWeight: winA ? 800 : 500, textAlign: 'center', color: winA ? 'var(--chalk)' : winH ? 'var(--muted)' : 'var(--chalk)', lineHeight: 1.3, maxWidth: 80 }}>
            {jogo.visitante}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────
const ROUND_DEFS = [
  { label: 'Round of 32', short: 'R32'    },
  { label: 'Oitavas',     short: 'Oitavas' },
  { label: 'Quartas',     short: 'Quartas' },
  { label: 'Semis',       short: 'Semis'   },
  { label: '3º lugar',    short: '3º'      },
  { label: 'Final',       short: 'Final'   },
]

export function ChaveamentoView({ bracket }: { bracket: Fase[] }) {
  const [activeTab, setActiveTab] = useState(0)

  const get = (label: string) => bracket.find(f => f.label === label)?.jogos ?? []

  const r32 = get('Round of 32')
  const r16 = get('Oitavas')
  const qf  = get('Quartas')
  const sf  = get('Semis')
  const t3  = get('3º lugar')
  const fin = get('Final')

  // Desktop bracket rounds split left/right
  const rounds = [
    { label: 'Round of 32', left: r32.slice(0, 8),  right: r32.slice(8, 16), count: 8 },
    { label: 'Oitavas',     left: r16.slice(0, 4),  right: r16.slice(4, 8),  count: 4 },
    { label: 'Quartas',     left: qf.slice(0, 2),   right: qf.slice(2, 4),   count: 2 },
    { label: 'Semis',       left: sf.slice(0, 1),   right: sf.slice(1, 2),   count: 1 },
  ]

  // Mobile: flat list per round
  const mobileRounds = [
    { label: 'Round of 32', jogos: r32 },
    { label: 'Oitavas',     jogos: r16 },
    { label: 'Quartas',     jogos: qf  },
    { label: 'Semis',       jogos: sf  },
    { label: '3º lugar',    jogos: t3  },
    { label: 'Final',       jogos: fin },
  ]

  const LABEL_H = 30

  const headers = [
    ...rounds.map((r, i) => ({ label: r.label, cx: lx(i) + CW / 2 })),
    { label: 'Final', cx: FINAL_X + CW / 2 },
    ...rounds.map((r, i) => ({ label: r.label, cx: rx(i) + CW / 2 })),
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Copa 2026</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 2px' }}>Chaveamento</h1>
        <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>Mata-mata — somente tempo regulamentar</p>
      </div>

      {/* ── MOBILE VIEW ───────────────────────────────────── */}
      <div className="md:hidden">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
          {ROUND_DEFS.map(({ short }, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 999,
                border: activeTab === i ? '1px solid var(--score)' : '1px solid var(--line)',
                background: activeTab === i ? 'rgba(255,203,46,.12)' : 'transparent',
                color: activeTab === i ? 'var(--score)' : 'var(--muted)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '.06em',
              }}
            >
              {short}
            </button>
          ))}
        </div>

        {/* Round title */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          {ROUND_DEFS[activeTab].label}
        </div>

        {/* Matches list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mobileRounds[activeTab].jogos.length > 0
            ? mobileRounds[activeTab].jogos.map((j, i) => <MobileMatchCard key={i} jogo={j} />)
            : Array.from({ length: activeTab === 0 ? 16 : activeTab === 1 ? 8 : activeTab === 2 ? 4 : activeTab === 3 ? 2 : 1 }).map((_, i) => (
                <MobileMatchCard key={i} jogo={null} />
              ))
          }
        </div>
      </div>

      {/* ── DESKTOP VIEW ─────────────────────────────────── */}
      <div className="hidden md:block" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
          <div style={{ position: 'relative', width: BW, height: LABEL_H + BH }}>

            {/* Round labels */}
            {headers.map(({ label, cx }, i) => (
              <div key={`h-${i}`} style={{
                position: 'absolute', top: 0, left: cx, transform: 'translateX(-50%)',
                fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                color: label === 'Final' ? 'var(--score)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </div>
            ))}

            {/* SVG lines */}
            <svg style={{ position: 'absolute', top: LABEL_H, left: 0, pointerEvents: 'none' }} width={BW} height={BH}>
              {[...buildPaths('left'), ...buildPaths('right')].map((d, i) => (
                <path key={i} d={d} fill="none" stroke={LINE} strokeWidth={1.5} />
              ))}
            </svg>

            {/* Cards */}
            <div style={{ position: 'absolute', top: LABEL_H, left: 0, width: BW, height: BH }}>
              {rounds.map((rnd, ri) => [
                ...Array.from({ length: rnd.count }).map((_, i) => (
                  <BracketCard key={`L${ri}-${i}`} jogo={rnd.left[i] ?? null} x={lx(ri)} y={cy(ri, i)} />
                )),
                ...Array.from({ length: rnd.count }).map((_, i) => (
                  <BracketCard key={`R${ri}-${i}`} jogo={rnd.right[i] ?? null} x={rx(ri)} y={cy(ri, i)} />
                )),
              ])}
              <BracketCard jogo={fin[0] ?? null} x={FINAL_X} y={BH / 2} isFinal />
            </div>
          </div>
        </div>

        {/* 3rd place */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>3º lugar</span>
          <div style={{ position: 'relative', width: CW + 30, height: CH + 4 }}>
            <BracketCard jogo={t3[0] ?? null} x={0} y={(CH + 4) / 2} />
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
        Times não definidos são atualizados automaticamente conforme o torneio avança.
      </p>
    </div>
  )
}
