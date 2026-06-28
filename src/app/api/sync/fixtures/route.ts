import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedRequest } from '@/lib/auth-api'
import { getFixtures, mapFase, mapStatus, placarFinal, classificado, teamId } from '@/lib/api-football'

export async function POST(req: Request) {
  if (!await isAuthorizedRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const fixtures = await getFixtures()
    const supabase = createServiceClient()

    const rows = fixtures.map((f) => {
      const status = mapStatus(f.fixture.status.short)
      const fase   = mapFase(f.league.round)
      const isMM   = fase !== 'grupos'
      const pf     = placarFinal(f)
      const cl     = (status === 'encerrado' && isMM) ? classificado(f) : null

      return {
        api_fixture_id:   f.fixture.id,
        fase,
        mandante:         f.teams.home.name,
        visitante:        f.teams.away.name,
        logo_mandante:    f.teams.home.logo,
        logo_visitante:   f.teams.away.logo,
        kickoff_at:       f.fixture.date,
        // enum jogos só tem agendado/encerrado; ao_vivo tratamos como agendado até encerrar
        status:           status === 'encerrado' ? 'encerrado' : 'agendado',
        placar_mandante:  status === 'encerrado' ? pf.mandante  : null,
        placar_visitante: status === 'encerrado' ? pf.visitante : null,
        classificado:     cl,
      }
    })

    const { error } = await supabase
      .from('jogos')
      .upsert(rows, { onConflict: 'api_fixture_id', ignoreDuplicates: false })

    if (error) throw new Error(JSON.stringify(error))

    return NextResponse.json({ ok: true, synced: rows.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
