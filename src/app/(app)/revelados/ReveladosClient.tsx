'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Share2, Check } from 'lucide-react'
import { calcularPontos } from '@/lib/pontuacao'
import { bandeira } from '@/lib/bandeiras'
import type { Jogo, Palpite } from '@/types'

interface PalpiteComNome extends Palpite {
  participantes: { nome: string } | null
}

interface Props {
  jogos: Jogo[]
  palpites: PalpiteComNome[]
  campeoMap: Record<string, string>
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function faseLabel(fase: string): string {
  const map: Record<string, string> = { grupos: 'Grupos', oitavas: 'Oitavas', quartas: 'Quartas', semi: 'Semi', terceiro: '3º lugar', final: 'Final' }
  return map[fase] ?? fase
}

function jogo_label(j: Jogo): string {
  return `${j.mandante} x ${j.visitante}`
}

function medalha(pts: number) {
  if (pts === 3) return '🎯'
  if (pts === 1) return '✅'
  return '❌'
}

async function compartilhar(texto: string) {
  if (navigator.share) {
    await navigator.share({ text: texto })
  } else {
    await navigator.clipboard.writeText(texto)
  }
}

export function ReveladosClient({ jogos, palpites, campeoMap }: Props) {
  const jogosOrdenados = [...jogos].sort((a, b) => {
    const temA = palpites.some(p => p.jogo_id === a.id) ? 1 : 0
    const temB = palpites.some(p => p.jogo_id === b.id) ? 1 : 0
    if (temB !== temA) return temB - temA
    return new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
  })

  const [sel, setSel]       = useState(jogosOrdenados[0]?.id)
  const [copiado, setCopiado] = useState(false)
  const jogo = jogos.find((j) => j.id === sel)!

  const palpitesJogo = palpites
    .filter((p) => p.jogo_id === sel)
    .map((p) => ({ ...p, pontos: calcularPontos(jogo, p) }))
    .sort((a, b) => b.pontos - a.pontos)

  const placar = jogo.placar_mandante !== null
    ? `${jogo.placar_mandante}-${jogo.placar_visitante}`
    : 'Aguardando resultado'

  function gerarTexto() {
    const data = new Date(jogo.kickoff_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
    const linhas = palpitesJogo.map((p) => {
      const nome = p.participantes?.nome ?? '?'
      return `${medalha(p.pontos)} ${nome}: ${p.placar_mandante}-${p.placar_visitante} · ${p.pontos > 0 ? '+' : ''}${p.pontos}pt${p.pontos !== 1 ? 's' : ''}`
    })
    return [
      `⚽ *Bolão Copa 2026 · ${data}*`,
      `*${jogo.mandante} ${placar} ${jogo.visitante}*`,
      '',
      ...linhas,
    ].join('\n')
  }

  async function handleShare() {
    await compartilhar(gerarTexto())
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">
          <Eye size={11} /> Palpites revelados
        </div>
        <h1 className="text-[24px] font-black mt-1">Jogos encerrados</h1>
        <p className="text-[var(--muted)] text-[13px] mt-1.5">Com o jogo no fim, tudo abre e a pontuação é calculada.</p>
      </div>

      {/* Pills seletoras */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {jogosOrdenados.map((j) => (
          <button
            key={j.id}
            onClick={() => setSel(j.id)}
            style={{
              flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 999,
              padding: '7px 14px', fontSize: 12, fontWeight: 700,
              border: `1px solid ${j.id === sel ? 'var(--muted)' : 'var(--line)'}`,
              background: j.id === sel ? 'var(--surface2)' : 'var(--surface)',
              color: j.id === sel ? 'var(--chalk)' : 'var(--muted)',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {jogo_label(j)}
          </button>
        ))}
      </div>

      {/* Card do resultado */}
      <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        <div className="text-center text-[10px] tracking-[.18em] uppercase font-bold mb-3" style={{ color: jogo.status === 'encerrado' ? 'var(--live)' : 'var(--muted)' }}>
          {jogo.status === 'encerrado' ? 'Encerrado' : 'Aguardando'} · {faseLabel(jogo.fase)}
        </div>
        <div className="grid gap-2 text-center" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
          <div className="flex flex-col items-center gap-1">
            {jogo.logo_mandante && <Image src={jogo.logo_mandante} alt={jogo.mandante} width={40} height={40} style={{ objectFit: 'contain' }} />}
            <div className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>{jogo.mandante}</div>
          </div>
          <div className="font-mono-custom text-[34px] font-bold">
            {jogo.placar_mandante ?? '-'}
            <span style={{ color: 'var(--score-dim)', margin: '0 6px' }}>:</span>
            {jogo.placar_visitante ?? '-'}
          </div>
          <div className="flex flex-col items-center gap-1">
            {jogo.logo_visitante && <Image src={jogo.logo_visitante} alt={jogo.visitante} width={40} height={40} style={{ objectFit: 'contain' }} />}
            <div className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>{jogo.visitante}</div>
          </div>
        </div>
        {jogo.classificado && (
          <div className="text-center text-[12px] font-bold mt-2" style={{ color: 'var(--score)' }}>
            Classificado: {jogo.classificado}
          </div>
        )}
      </div>

      {/* Palpites */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
        {palpitesJogo.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>Nenhum palpite registrado.</div>
        ) : (
          palpitesJogo.map((p, i) => {
            const nome = p.participantes?.nome ?? 'Participante'
            const pts = p.pontos
            return (
              <div key={p.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold flex-none"
                  style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {initials(nome)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate">{nome}</div>
                  {campeoMap[p.participante_id] && (
                    <div className="text-[11px] font-semibold truncate" style={{ color: 'var(--score)' }}>
                      {bandeira(campeoMap[p.participante_id])} {campeoMap[p.participante_id]}
                    </div>
                  )}
                </div>
                <span className="font-mono-custom text-[13px]" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                  {p.placar_mandante}-{p.placar_visitante}
                </span>
                <span className={`font-mono-custom font-bold text-[15px] min-w-[52px] text-right flex-shrink-0`}
                  style={{ color: pts === 0 ? 'var(--muted)' : 'var(--mint)' }}>
                  {pts > 0 ? '+' : ''}{pts}pt{pts !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Rodapé regras */}
      <div className="flex gap-2 items-start text-[11.5px] leading-relaxed rounded-xl p-3 mb-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
        <span>🎯 Placar exato = <strong style={{ color: 'var(--chalk)' }}>3 pts</strong> · Resultado certo = <strong style={{ color: 'var(--chalk)' }}>1 pt</strong> · Erro = 0 pts. Somente tempo regulamentar (90 min).</span>
      </div>

      {/* Botão compartilhar */}
      {palpitesJogo.length > 0 && (
        <button
          onClick={handleShare}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '13px 0', borderRadius: 13, fontSize: 14, fontWeight: 800,
            border: '1px solid var(--line)', background: 'var(--surface)',
            color: copiado ? 'var(--mint)' : 'var(--chalk)',
            fontFamily: 'inherit', cursor: 'pointer', transition: 'color .2s',
            marginBottom: 80,
          }}
        >
          {copiado ? <Check size={16} /> : <Share2 size={16} />}
          {copiado ? 'Copiado para área de transferência!' : 'Compartilhar no WhatsApp'}
        </button>
      )}
    </div>
  )
}
