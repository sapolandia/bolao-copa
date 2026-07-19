import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedRequest } from '@/lib/auth-api'
import { getFixtures, mapFase, mapStatus, placarFinal, classificado, teamId } from '@/lib/api-football'

export async function POST(req: Request) {
  if (!await isAuthorizedRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const hoje   = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const amanha = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const inicio = new Date(`${hoje}T03:00:00-03:00`).getTime()
    const fim    = new Date(`${amanha}T03:00:00-03:00`).getTime()

    const [fixturesHoje, fixturesAmanha] = await Promise.all([
      getFixtures({ date: hoje }),
      getFixtures({ date: amanha }),
    ])
    const fixtures = [...fixturesHoje, ...fixturesAmanha].filter((f) => {
      const t = new Date(f.fixture.date).getTime()
      return t >= inicio && t < fim
    })

    const supabase = createServiceClient()

    if (fixtures.length === 0) {
      return NextResponse.json({ ok: true, synced: 0 })
    }

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
