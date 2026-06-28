import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminPanel } from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: participante } = await supabase
    .from('participantes').select('is_admin').eq('id', user!.id).single()
  if (!participante?.is_admin) redirect('/palpites')

  const { data: jogos } = await supabase.from('jogos').select('*').order('kickoff_at')
  const { data: participantes } = await supabase
    .from('participantes').select('id, nome, email, telefone').order('nome')

  return <AdminPanel jogos={jogos ?? []} participantes={participantes ?? []} />
}
