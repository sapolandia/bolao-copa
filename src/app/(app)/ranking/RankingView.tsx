import { Trophy, ListChecks } from 'lucide-react'

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

export function RankingView({ ranking, myId }: Props) {
  const top3 = ranking.slice(0, 3)
  const resto = ranking.slice(3)

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">
          <Trophy size={11} /> Classificação
        </div>
        <h1 className="text-[24px] font-black mt-1">Bolão dos amigos</h1>
        <p className="text-[var(--muted)] text-[13px] mt-1.5">Campeão é quem somar mais pontos no fim da Copa.</p>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-2xl p-8 text-center text-[var(--muted)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          Nenhum ponto ainda. Comece a jogar!
        </div>
      ) : (
        <>
          {/* Pódio */}
          {top3.length >= 3 && (
            <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: '1fr 1.2fr 1fr', alignItems: 'end' }}>
              {[top3[1], top3[0], top3[2]].map((p, i) => {
                const isFirst = i === 1
                return (
                  <div key={p.participante_id}
                    className={`rounded-2xl text-center ${isFirst ? 'pt-5 pb-4' : 'py-4'}`}
                    style={{
                      background: isFirst ? 'linear-gradient(180deg,rgba(255,203,46,.12),var(--surface))' : 'var(--surface)',
                      border: `1px solid ${isFirst ? 'var(--score)' : 'var(--line)'}`,
                      padding: isFirst ? '18px 8px 16px' : '14px 8px',
                    }}
                  >
                    <div className="text-[22px]">{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</div>
                    <div className="text-[13px] font-extrabold mt-1.5">{p.nome.split(' ')[0]}</div>
                    <div className="font-mono-custom font-bold text-[17px] mt-0.5" style={{ color: 'var(--score)' }}>{p.pontos}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '4px 16px' }}>
            {ranking.map((r, i) => {
              const isMe = r.participante_id === myId
              return (
                <div key={r.participante_id}
                  className={`flex items-center gap-3 py-3.5 ${i > 0 ? 'border-t border-[var(--line)]' : ''}`}
                  style={isMe ? { background: 'rgba(255,203,46,.07)', margin: '0 -16px', padding: '13px 16px', borderRadius: 11, borderTop: 'none' } : {}}
                >
                  <span className="font-mono-custom text-[14px] text-[var(--muted)] w-6">{r.posicao}º</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold flex-none"
                    style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                    {initials(r.nome)}
                  </span>
                  <span className="flex-1 text-[14.5px] font-bold">{r.nome}</span>
                  <span className="font-mono-custom text-[10.5px] text-[var(--muted)] text-right leading-snug">
                    {r.placares_exatos} exatos<br />{r.acertos_resultado} result.
                  </span>
                  <span className="font-mono-custom font-bold text-[18px] min-w-[42px] text-right" style={{ color: 'var(--score)' }}>
                    {r.pontos}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 items-start text-[var(--muted)] text-[11.5px] leading-relaxed rounded-xl p-3 mt-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <ListChecks size={15} className="flex-none mt-0.5 text-[var(--mint)]" />
            <span>Empate? Desempata por mais placares exatos, depois mais acertos de resultado. Persistindo, o prêmio é dividido.</span>
          </div>
        </>
      )}
    </div>
  )
}
