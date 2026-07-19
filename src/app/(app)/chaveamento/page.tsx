import { ChaveamentoView } from './ChaveamentoView'
import { getFixtures, mapStatus, placarFinal } from '@/lib/api-football'
import { ordenarPorChaveamento } from '@/lib/bracket-order'

const ROUNDS = [
  { key: 'Round of 32',     label: 'Round of 32' },
  { key: 'Round of 16',     label: 'Oitavas'     },
  { key: 'Quarter-finals',  label: 'Quartas'     },
  { key: 'Semi-finals',     label: 'Semis'       },
  { key: '3rd Place Final', label: '3º lugar'    },
  { key: 'Final',           label: 'Final'       },
]

export const revalidate = 60

export default async function ChaveamentoPage() {
  const fixtures = await getFixtures()

  const bracket = ROUNDS.map(({ key, label }) => {
    const jogos = ordenarPorChaveamento(
      fixtures.filter((f) => f.league.round === key),
      key,
    )
      .map((f) => {
        const status = mapStatus(f.fixture.status.short)
        const pf = placarFinal(f)
        return {
          id:             f.fixture.id,
          data:           f.fixture.date,
          statusShort:    f.fixture.status.short,
          ao_vivo:        ['1H','HT','2H','ET','BT','P'].includes(f.fixture.status.short),
          elapsed:        f.fixture.status.elapsed,
          mandante:       f.teams.home.name,
          visitante:      f.teams.away.name,
          logo_mandante:  f.teams.home.logo,
          logo_visitante: f.teams.away.logo,
          gols_mandante:  status === 'encerrado' || f.fixture.status.elapsed ? pf.mandante  : null,
          gols_visitante: status === 'encerrado' || f.fixture.status.elapsed ? pf.visitante : null,
          encerrado:      status === 'encerrado',
        }
      })

    return { label, jogos }
  })

  return <ChaveamentoView bracket={bracket} />
}
