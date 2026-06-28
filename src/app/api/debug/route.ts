import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFixtures, mapFase, mapStatus, placarFinal, classificado, LEAGUE_ID, SEASON } from '@/lib/api-football'

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY ? `***${process.env.API_FOOTBALL_KEY.slice(-4)}` : 'NÃO CONFIGURADA',
      LEAGUE_ID,
      SEASON,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NÃO CONFIGURADA',
    },
  }

  // 1. Testa chamada API-Football
  try {
    const today = new Date().toISOString().slice(0, 10)
    const fixtures = await getFixtures({ date: today })
    results.api_football = {
      ok: true,
      hoje: today,
      total_fixtures_hoje: fixtures.length,
      fixtures: fixtures.slice(0, 3).map((f) => ({
        id: f.fixture.id,
        date: f.fixture.date,
        status: f.fixture.status.short,
        status_mapped: mapStatus(f.fixture.status.short),
        round: f.league.round,
        fase_mapped: mapFase(f.league.round),
        home: f.teams.home.code,
        away: f.teams.away.code,
        placar_final: placarFinal(f),
        classificado: classificado(f),
      })),
    }
  } catch (e: unknown) {
    results.api_football = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  // 2. Testa conexão Supabase
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('jogos').select('id, mandante, visitante, kickoff_at, api_fixture_id').limit(3)
    if (error) throw error
    results.supabase = { ok: true, jogos_no_banco: data }
  } catch (e: unknown) {
    results.supabase = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  // 3. Testa se a coluna api_fixture_id existe
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('jogos').select('api_fixture_id').limit(1)
    results.coluna_api_fixture_id = error
      ? { existe: false, erro: error.message }
      : { existe: true }
  } catch (e: unknown) {
    results.coluna_api_fixture_id = { existe: false, erro: String(e) }
  }

  return NextResponse.json(results, { status: 200 })
}
