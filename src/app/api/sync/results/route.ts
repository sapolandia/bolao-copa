import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedRequest } from '@/lib/auth-api'
import { getFixtures, mapStatus, placarFinal, classificado, mapFase } from '@/lib/api-football'

export async function POST(req: Request) {
  if (!await isAuthorizedRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const dates = getPastTwoDays()
    const supabase = createServiceClient()
    let updated = 0

    for (const date of dates) {
      const fixtures = await getFixtures({ date })
      const encerrados = fixtures.filter(
        (f) => mapStatus(f.fixture.status.short) === 'encerrado'
      )

      for (const f of encerrados) {
        const fase = mapFase(f.league.round)
        const pf   = placarFinal(f)
        const cl   = fase !== 'grupos' ? classificado(f) : null

        const { error } = await supabase
          .from('jogos')
          .update({
            status:           'encerrado',
            placar_mandante:  pf.mandante,
            placar_visitante: pf.visitante,
            classificado:     cl,
          })
          .eq('api_fixture_id', f.fixture.id)
          .neq('status', 'encerrado')

        if (!error) updated++
      }
    }

    return NextResponse.json({ ok: true, updated })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function getPastTwoDays(): string[] {
  return [-1, 0, 1].map((offset) => {
    const d = new Date(Date.now() + offset * 86400000)
    return d.toISOString().slice(0, 10)
  })
}
