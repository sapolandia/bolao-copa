import { createClient } from '@/lib/supabase/server'
import { PalpitesClient } from './PalpitesClient'
import { deadlineHoje, palpitesTravados } from '@/lib/pontuacao'
import type { Jogo } from '@/types'

export default async function PalpitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hoje  = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const amanha = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

  const { data: jogos } = await supabase
    .from('jogos')
    .select('*')
    .gte('kickoff_at', `${hoje}T00:00:00-03:00`)
    .lt('kickoff_at', `${amanha}T03:00:00-03:00`)
    .neq('fase', 'grupos')
    .order('kickoff_at')

  const { data: palpites } = await supabase
    .from('palpites')
    .select('*')
    .eq('participante_id', user!.id)
    .in('jogo_id', (jogos ?? []).map((j: Jogo) => j.id))

  const { data: campeao } = await supabase
    .from('palpite_campeao')
    .select('time_campeao')
    .eq('participante_id', user!.id)
    .maybeSingle()

  // Campeão fica bloqueado a partir do início da Copa (11 jun 2026 16:00 UTC)
  const inicioCopa = new Date('2026-06-11T16:00:00Z')
  const campeaoBloqueado = new Date() >= inicioCopa

  return (
    <PalpitesClient
      jogos={jogos ?? []}
      palpitesIniciais={palpites ?? []}
      campeaoInicial={campeao?.time_campeao ?? null}
      campeaoBloqueado={campeaoBloqueado}
      trava={deadlineHoje().toISOString()}
      travado={palpitesTravados()}
      userId={user!.id}
      isPrimeiroAcesso={!campeao}
    />
  )
}
