'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import { calcularPontos } from '@/lib/pontuacao'
import type { Jogo, Palpite } from '@/types'

interface PalpiteComNome extends Palpite {
  participantes: { nome: string } | null
}

interface Props {
  jogos: Jogo[]
  palpites: PalpiteComNome[]
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function faseLabel(fase: string): string {
  const map: Record<string, string> = {
    grupos: 'Fase de grupos · máx 3',
    oitavas: 'Oitavas · máx 5',
    quartas: 'Quartas · máx 5',
    semi: 'Semifinal · máx 5',
    terceiro: '3º lugar · máx 5',
    final: 'Final · máx 5',
  }
  return map[fase] ?? fase
}

export function ReveladosClient({ jogos, palpites }: Props) {
  const [sel, setSel] = useState(jogos[0]?.id)
  const jogo = jogos.find((j) => j.id === sel)!

  const palpitesJogo = palpites
    .filter((p) => p.jogo_id === sel)
    .map((p) => ({ ...p, pontos: calcularPontos(jogo, p) }))
    .sort((a, b) => b.pontos - a.pontos)

  const isMM = jogo.fase !== 'grupos'

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">
          <Eye size={11} /> Palpites revelados
        </div>
        <h1 className="text-[24px] font-black mt-1">Jogos encerrados</h1>
        <p className="text-[var(--muted)] text-[13px] mt-1.5">Com o jogo no fim, tudo abre e a pontuação é calculada na hora.</p>
      </div>

      {/* Pills seletoras */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {jogos.map((j) => (
          <button
            key={j.id}
            onClick={() => setSel(j.id)}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-bold transition-all flex-none ${j.id === sel ? 'text-[var(--chalk)] border-[var(--muted)]' : 'text-[var(--muted)] border-[var(--line)]'}`}
            style={{ border: `1px solid ${j.id === sel ? 'var(--muted)' : 'var(--line)'}`, background: j.id === sel ? 'var(--surface2)' : 'var(--surface)', fontFamily: 'inherit' }}
          >
            {jogo_label(j)}
          </button>
        ))}
      </div>

      {/* Card do resultado */}
      <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        <div className="text-center text-[10px] tracking-[.18em] uppercase font-bold text-[var(--live)] mb-3">
          Encerrado · {faseLabel(jogo.fase)}
        </div>
        <div className="grid gap-2 text-center" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
          <div className="flex flex-col items-center gap-1">
            {jogo.logo_mandante && <Image src={jogo.logo_mandante} alt={jogo.mandante} width={40} height={40} style={{ objectFit: 'contain' }} />}
            <div className="text-[12px] text-[var(--muted)] mt-1">{jogo.mandante}</div>
          </div>
          <div className="font-mono-custom text-[34px] font-bold">
            {jogo.placar_mandante}
            <span className="text-[var(--score-dim)] mx-1.5">:</span>
            {jogo.placar_visitante}
          </div>
          <div className="flex flex-col items-center gap-1">
            {jogo.logo_visitante && <Image src={jogo.logo_visitante} alt={jogo.visitante} width={40} height={40} style={{ objectFit: 'contain' }} />}
            <div className="text-[12px] text-[var(--muted)] mt-1">{jogo.visitante}</div>
          </div>
        </div>
        {isMM && jogo.classificado && (
          <div className="text-center text-[12px] font-bold mt-2" style={{ color: 'var(--score)' }}>
            Classificado: {jogo.classificado}
          </div>
        )}
      </div>

      {/* Palpites */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        {palpitesJogo.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted)] text-sm">Nenhum palpite registrado.</div>
        ) : (
          palpitesJogo.map((p, i) => {
            const nome = p.participantes?.nome ?? 'Participante'
            const pts = p.pontos
            return (
              <div key={p.id}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--line)]' : ''}`}
                style={{}}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold flex-none"
                  style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {initials(nome)}
                </span>
                <span className="flex-1 text-[14px] font-bold">{nome}</span>
                <span className="font-mono-custom text-[13px] text-[var(--muted)]">
                  {p.placar_mandante}-{p.placar_visitante}
                  {isMM && p.classificado ? ` → ${p.classificado}` : ''}
                </span>
                <span className={`font-mono-custom font-bold text-[15px] min-w-[54px] text-right ${pts === 0 ? 'text-[var(--muted)]' : 'text-[var(--mint)]'}`}>
                  {pts > 0 ? '+' : ''}{pts} pt{pts === 1 ? '' : 's'}
                </span>
              </div>
            )
          })
        )}
        <div className="px-4 py-3 border-t border-dashed border-[var(--line)] text-[11px] text-[var(--muted)] leading-relaxed">
          {isMM
            ? 'Mata-mata: placar exato +2, resultado certo +1, classificado certo +2. Máximo de 5 por jogo.'
            : 'Fase de grupos: placar exato vale 3, acertar só o vencedor ou empate vale 1.'}
        </div>
      </div>
    </div>
  )
}

function jogo_label(j: Jogo): string {
  return `${j.mandante} x ${j.visitante}`
}
