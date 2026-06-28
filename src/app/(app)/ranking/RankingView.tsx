'use client'

import { useState } from 'react'
import { Trophy, ListChecks, Share2, Check } from 'lucide-react'

interface EntradaRanking {
  participante_id: string
  nome: string
  pontos: number
  placares_exatos: number
  acertos_resultado: number
  posicao: number
}

interface Props {
  ranking: EntradaRanking[]
  myId: string
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

async function compartilhar(texto: string, setCopied: (v: boolean) => void) {
  if (navigator.share) {
    await navigator.share({ text: texto })
  } else {
    await navigator.clipboard.writeText(texto)
  }
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

export function RankingView({ ranking, myId }: Props) {
  const [copiado, setCopiado] = useState(false)
  const top3 = ranking.slice(0, 3)
  const resto = ranking.slice(3)

  function gerarTexto() {
    const emojis = ['🥇', '🥈', '🥉']
    const linhas = ranking.map((r) => {
      const emoji = emojis[r.posicao - 1] ?? `${r.posicao}º`
      return `${emoji} ${r.nome.split(' ')[0]} · ${r.pontos}pts`
    })
    return ['🏆 *Bolão Copa 2026 — Ranking*', '', ...linhas, '', '⚽ Quem vai ganhar?'].join('\n')
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] tracking-[.18em] uppercase font-semibold" style={{ color: 'var(--muted)' }}>
          <Trophy size={11} /> Classificação
        </div>
        <h1 className="text-[24px] font-black mt-1">Bolão dos amigos</h1>
        <p className="text-[13px] mt-1.5" style={{ color: 'var(--muted)' }}>Campeão é quem somar mais pontos no fim da Copa.</p>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
          Nenhum ponto ainda. Comece a jogar!
        </div>
      ) : (
        <>
          {/* Pódio — só aparece quando há pelo menos 3 */}
          {top3.length >= 3 && (
            <div className="mb-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 8, alignItems: 'end' }}>
              {[top3[1], top3[0], top3[2]].map((p, i) => {
                const isFirst = i === 1
                return (
                  <div key={p.participante_id}
                    style={{
                      background: isFirst ? 'linear-gradient(180deg,rgba(255,203,46,.12),var(--surface))' : 'var(--surface)',
                      border: `1px solid ${isFirst ? 'var(--score)' : 'var(--line)'}`,
                      borderRadius: 18,
                      padding: isFirst ? '18px 6px 16px' : '14px 6px',
                      textAlign: 'center',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nome.split(' ')[0]}
                    </div>
                    <div className="font-mono-custom" style={{ fontWeight: 700, fontSize: 17, marginTop: 2, color: 'var(--score)' }}>
                      {p.pontos}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '4px 16px' }}>
            {ranking.map((r, i) => {
              const isMe = r.participante_id === myId
              return (
                <div key={r.participante_id}
                  className="flex items-center gap-3 py-3"
                  style={{
                    borderTop: i > 0 && !isMe ? '1px solid var(--line)' : 'none',
                    ...(isMe ? { background: 'rgba(255,203,46,.07)', margin: '0 -16px', padding: '13px 16px', borderRadius: 11 } : {}),
                  }}
                >
                  <span className="font-mono-custom text-[14px] w-6 flex-shrink-0" style={{ color: 'var(--muted)' }}>{r.posicao}º</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
                    style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                    {initials(r.nome)}
                  </span>
                  <span className="flex-1 text-[14.5px] font-bold min-w-0 truncate">{r.nome}</span>
                  <span className="font-mono-custom text-[10.5px] text-right leading-snug flex-shrink-0" style={{ color: 'var(--muted)' }}>
                    {r.placares_exatos} exatos<br />{r.acertos_resultado} result.
                  </span>
                  <span className="font-mono-custom font-bold text-[18px] min-w-[42px] text-right flex-shrink-0" style={{ color: 'var(--score)' }}>
                    {r.pontos}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Botão compartilhar */}
          <button
            onClick={() => compartilhar(gerarTexto(), setCopiado)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '13px 0', borderRadius: 13, fontSize: 14, fontWeight: 800,
              border: '1px solid var(--line)', background: 'var(--surface)',
              color: copiado ? 'var(--mint)' : 'var(--chalk)',
              fontFamily: 'inherit', cursor: 'pointer', transition: 'color .2s', marginBottom: 12,
            }}
          >
            {copiado ? <Check size={16} /> : <Share2 size={16} />}
            {copiado ? 'Copiado!' : 'Compartilhar ranking'}
          </button>

          <div className="flex gap-2 items-start text-[11.5px] leading-relaxed rounded-xl p-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
            <ListChecks size={15} className="flex-none mt-0.5" style={{ color: 'var(--mint)' }} />
            <span>Empate? Desempata por mais placares exatos, depois mais acertos de resultado. Persistindo, o prêmio é dividido.</span>
          </div>
        </>
      )}
    </div>
  )
}
