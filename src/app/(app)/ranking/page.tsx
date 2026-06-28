import { createClient } from '@/lib/supabase/server'
import { RankingView } from './RankingView'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ranking } = await supabase.rpc('calcular_ranking')

  return <RankingView ranking={ranking ?? []} myId={user!.id} />
}
