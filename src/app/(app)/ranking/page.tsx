import { createClient } from '@/lib/supabase/server'
import { RankingView } from './RankingView'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ranking }, { data: palpitesCampeao }, { data: jogosEncerrados }] = await Promise.all([
    supabase.rpc('calcular_ranking'),
    supabase
      .from('palpite_campeao')
      .select('participante_id, time_campeao, participantes(nome)'),
    supabase
      .from('jogos')
      .select('mandante, visitante, placar_mandante, placar_visitante')
      .neq('fase', 'grupos')
      .eq('status', 'encerrado')
      .not('placar_mandante', 'is', null),
  ])

  // Times eliminados = perderam algum jogo do mata-mata
  const eliminados = new Set<string>()
  for (const j of jogosEncerrados ?? []) {
    if (j.placar_mandante! < j.placar_visitante!) eliminados.add(j.mandante)
    if (j.placar_visitante! < j.placar_mandante!) eliminados.add(j.visitante)
  }

  const campeoMap: Record<string, { time: string; eliminado: boolean }> = {}
  const campeoes = (palpitesCampeao ?? []).map((p) => ({
    participante_id: p.participante_id,
    nome: (p.participantes as unknown as { nome: string } | null)?.nome ?? '?',
    time_campeao: p.time_campeao,
    eliminado: eliminados.has(p.time_campeao),
  })).sort((a, b) => Number(a.eliminado) - Number(b.eliminado) || a.nome.localeCompare(b.nome))

  for (const c of campeoes) campeoMap[c.participante_id] = { time: c.time_campeao, eliminado: c.eliminado }

  return <RankingView ranking={ranking ?? []} myId={user!.id} campeoMap={campeoMap} />
}
