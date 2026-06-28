import { NextResponse } from 'next/server'
import { getFixtures, mapStatus, placarFinal } from '@/lib/api-football'

const ROUNDS = [
  { key: 'Round of 32',      label: 'Round of 32',  fase: 'oitavas32' },
  { key: 'Round of 16',      label: 'Oitavas',      fase: 'oitavas'   },
  { key: 'Quarter-finals',   label: 'Quartas',      fase: 'quartas'   },
  { key: 'Semi-finals',      label: 'Semis',        fase: 'semi'      },
  { key: '3rd Place Final',  label: '3º lugar',     fase: 'terceiro'  },
  { key: 'Final',            label: 'Final',        fase: 'final'     },
]

export async function GET() {
  try {
    // Busca todos os fixtures de uma vez
    const fixtures = await getFixtures()

    const bracket = ROUNDS.map(({ key, label, fase }) => {
      const jogos = fixtures
        .filter((f) => f.league.round === key)
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
        .map((f) => {
          const status = mapStatus(f.fixture.status.short)
          const pf = placarFinal(f)
          return {
            id:              f.fixture.id,
            data:            f.fixture.date,
            status:          f.fixture.status.short,
            status_mapped:   status,
            mandante:        f.teams.home.name,
            visitante:       f.teams.away.name,
            logo_mandante:   f.teams.home.logo,
            logo_visitante:  f.teams.away.logo,
            gols_mandante:   status === 'encerrado' ? pf.mandante  : null,
            gols_visitante:  status === 'encerrado' ? pf.visitante : null,
            ao_vivo:         ['1H','HT','2H','ET','BT','P'].includes(f.fixture.status.short),
            elapsed:         f.fixture.status.elapsed,
          }
        })

      return { key, label, fase, jogos }
    })

    return NextResponse.json({ bracket }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
