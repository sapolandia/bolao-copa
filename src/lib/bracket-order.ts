import type { APIFixture } from './api-football'

// Ordem oficial do chaveamento das oitavas-de-32 (Round of 32).
// Cada item é um jogo (mandante x visitante); jogos vizinhos em pares (0-1, 2-3, ...)
// alimentam o mesmo confronto das oitavas-de-16, e assim sucessivamente até a final.
// Nomes seguem a grafia retornada pela API-Football (ver src/lib/bandeiras.ts).
const R32_BRACKET_ORDER: [string, string][] = [
  ['Brazil', 'Japan'],
  ['Ivory Coast', 'Norway'],
  ['Mexico', 'Ecuador'],
  ['England', 'Congo DR'],
  ['Argentina', 'Cape Verde Islands'],
  ['Australia', 'Egypt'],
  ['Switzerland', 'Algeria'],
  ['Colombia', 'Ghana'],
  ['France', 'Sweden'],
  ['Germany', 'Paraguay'],
  ['Canada', 'South Africa'],
  ['Netherlands', 'Morocco'],
  ['Portugal', 'Croatia'],
  ['Spain', 'Austria'],
  ['United States', 'Bosnia & Herzegovina'],
  ['Belgium', 'Senegal'],
]

const TEAM_TO_R32_INDEX = new Map<string, number>()
R32_BRACKET_ORDER.forEach(([home, away], i) => {
  TEAM_TO_R32_INDEX.set(home, i)
  TEAM_TO_R32_INDEX.set(away, i)
})

// Divisor que converte o índice do jogo das oitavas-de-32 (0-15) na posição
// dentro de cada fase seguinte (jogos com o mesmo resultado da divisão caem no mesmo slot do chaveamento).
const ROUND_DIVISOR: Record<string, number> = {
  'Round of 32':     1,
  'Round of 16':     2,
  'Quarter-finals':  4,
  'Semi-finals':     8,
  '3rd Place Final': 16,
  'Final':           16,
}

// Retorna a posição do jogo dentro do chaveamento (menor = mais acima/à esquerda na árvore).
// Usa o histórico de qual jogo das oitavas-de-32 cada time disputou; caso o time não seja
// reconhecido (fallback), o jogo vai para o fim, ordenado pela data.
export function bracketSlot(f: APIFixture, round: string): number {
  const idx = TEAM_TO_R32_INDEX.get(f.teams.home.name) ?? TEAM_TO_R32_INDEX.get(f.teams.away.name)
  const divisor = ROUND_DIVISOR[round] ?? 1
  if (idx === undefined) return Number.MAX_SAFE_INTEGER
  return Math.floor(idx / divisor)
}

export function ordenarPorChaveamento(fixtures: APIFixture[], round: string): APIFixture[] {
  return [...fixtures].sort((a, b) => {
    const slotDiff = bracketSlot(a, round) - bracketSlot(b, round)
    if (slotDiff !== 0) return slotDiff
    return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  })
}
