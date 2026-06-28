import { NextResponse } from 'next/server'
import { getTopScorers } from '@/lib/api-football'

// Retorna lista de jogadores para o palpite de artilheiro.
// Usa a lista de artilheiros atuais da Copa (quando já em andamento)
// ou uma lista estática de pré-Copa.
export async function GET() {
  try {
    const scorers = await getTopScorers()

    const players = scorers.map((s) => ({
      id:    s.player.id,
      nome:  s.player.name,
      gols:  s.statistics[0]?.goals?.total ?? 0,
    }))

    return NextResponse.json({ players })
  } catch {
    // Fallback: retorna lista curada caso a API falhe ou a Copa não tenha começado
    return NextResponse.json({ players: FALLBACK_PLAYERS })
  }
}

const FALLBACK_PLAYERS = [
  'Mbappé', 'Vini Jr.', 'Haaland', 'Messi', 'Julián Álvarez',
  'Lautaro Martínez', 'Bellingham', 'Rodri', 'Lewandowski', 'Neymar',
  'Salah', 'Kane', 'Osimhen', 'Raphinha', 'Endrick',
].map((nome, i) => ({ id: i + 1, nome, gols: 0 }))
