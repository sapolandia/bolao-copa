const BASE = 'https://v3.football.api-sports.io'

export const LEAGUE_ID = Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1)
export const SEASON    = Number(process.env.API_FOOTBALL_SEASON ?? 2026)

async function apiFetch<T>(path: string): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) throw new Error('API_FOOTBALL_KEY não configurada')

  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-apisports-key': key },
    next: { revalidate: 0 },
  })

  if (!res.ok) throw new Error(`API-Football ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors && Object.keys(json.errors).length) {
    throw new Error(JSON.stringify(json.errors))
  }
  return json.response as T
}

// ── tipos da API ──────────────────────────────────────────────────────────────

export interface APIFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; elapsed: number | null }
  }
  league: { round: string }
  teams: {
    home: { id: number; name: string; code: string | null; logo: string }
    away: { id: number; name: string; code: string | null; logo: string }
  }
  goals: { home: number | null; away: number | null }
  score: {
    extratime: { home: number | null; away: number | null }
    penalty:   { home: number | null; away: number | null }
  }
}

export interface APIPlayer {
  player: { id: number; name: string }
  statistics: { goals: { total: number | null } }[]
}

// ── chamadas ──────────────────────────────────────────────────────────────────

export function getFixtures(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams({
    league: String(LEAGUE_ID),
    season: String(SEASON),
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })
  return apiFetch<APIFixture[]>(`/fixtures?${qs}`)
}

export function getLiveFixtures() {
  return apiFetch<APIFixture[]>(
    `/fixtures?league=${LEAGUE_ID}&season=${SEASON}&live=all`
  )
}

export function getTopScorers() {
  return apiFetch<APIPlayer[]>(
    `/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`
  )
}

// ── helpers de mapeamento ─────────────────────────────────────────────────────

const STATUS_ENCERRADO = ['FT', 'AET', 'PEN', 'AWD', 'WO']
const STATUS_AO_VIVO   = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']

export function mapStatus(short: string): 'agendado' | 'ao_vivo' | 'encerrado' {
  if (STATUS_ENCERRADO.includes(short)) return 'encerrado'
  if (STATUS_AO_VIVO.includes(short))   return 'ao_vivo'
  return 'agendado'
}

export function mapFase(round: string): string {
  const r = round.toLowerCase()
  if (r.includes('group'))                             return 'grupos'
  if (r.includes('round of 32') || r.includes('of 32')) return 'oitavas' // Copa 2026: fase extra
  if (r.includes('round of 16') || r.includes('of 16')) return 'oitavas'
  if (r.includes('quarter'))                           return 'quartas'
  if (r.includes('semi'))                              return 'semi'
  if (r.includes('3rd') || r.includes('third'))        return 'terceiro'
  if (r.includes('final'))                             return 'final'
  return 'grupos'
}

// Placar final após prorrogação (sem contar pênaltis no placar)
export function placarFinal(f: APIFixture): { mandante: number | null; visitante: number | null } {
  const et = f.score.extratime
  if (et.home !== null && et.away !== null) {
    return {
      mandante:  (f.goals.home ?? 0) + et.home,
      visitante: (f.goals.away ?? 0) + et.away,
    }
  }
  return { mandante: f.goals.home, visitante: f.goals.away }
}

// Quem se classificou — usa nome completo do time como identificador
export function classificado(f: APIFixture): string | null {
  const pen = f.score.penalty
  if (pen.home !== null && pen.away !== null) {
    return pen.home > pen.away ? f.teams.home.name : f.teams.away.name
  }
  const { mandante, visitante } = placarFinal(f)
  if (mandante === null || visitante === null) return null
  if (mandante > visitante) return f.teams.home.name
  if (visitante > mandante) return f.teams.away.name
  return null
}

// Identificador curto: usa code da API se existir, senão 3 primeiras letras do nome em maiúsculo
export function teamId(team: { id: number; name: string; code: string | null }): string {
  return team.code ?? team.name.slice(0, 3).toUpperCase()
}
