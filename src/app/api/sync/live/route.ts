import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedRequest } from '@/lib/auth-api'
import { getLiveFixtures, mapFase, placarFinal, classificado } from '@/lib/api-football'

export async function GET() {
  try {
    const fixtures = await getLiveFixtures()
    const live = fixtures.map((f) => ({
      api_fixture_id: f.fixture.id,
      mandante:       f.teams.home.code,
      visitante:      f.teams.away.code,
      gols_mandante:  f.goals.home ?? 0,
      gols_visitante: f.goals.away ?? 0,
      status:         f.fixture.status.short,
    }))
    return NextResponse.json({ live })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await isAuthorizedRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const fixtures = await getLiveFixtures()
    const supabase = createServiceClient()
    let updated = 0

    for (const f of fixtures) {
      const done = ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(f.fixture.status.short)
      if (!done) continue
      const fase = mapFase(f.league.round)
      const pf   = placarFinal(f)
      const cl   = fase !== 'grupos' ? classificado(f) : null

      const { error } = await supabase.from('jogos').update({
        status:           'encerrado',
        placar_mandante:  pf.mandante,
        placar_visitante: pf.visitante,
        classificado:     cl,
      }).eq('api_fixture_id', f.fixture.id)

      if (!error) updated++
    }

    return NextResponse.json({ ok: true, updated })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
