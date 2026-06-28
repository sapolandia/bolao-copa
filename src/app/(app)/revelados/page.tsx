import { createClient } from '@/lib/supabase/server'
import { ReveladosClient } from './ReveladosClient'

export default async function ReveladosPage() {
  const supabase = await createClient()

  // Jogos encerrados do mata-mata
  const { data: jogos } = await supabase
    .from('jogos')
    .select('*')
    .eq('status', 'encerrado')
    .neq('fase', 'grupos')
    .order('kickoff_at', { ascending: false })

  if (!jogos?.length) {
    return (
      <div>
        <div className="mb-5">
          <div className="text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">Palpites revelados</div>
          <h1 className="text-[24px] font-black mt-1">Jogos encerrados</h1>
        </div>
        <div className="rounded-2xl p-8 text-center text-[var(--muted)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          Ainda não há jogos encerrados.
        </div>
      </div>
    )
  }

  // Palpites de todos para esses jogos
  const { data: palpites } = await supabase
    .from('palpites')
    .select('*, participantes(nome)')
    .in('jogo_id', jogos.map((j) => j.id))

  return <ReveladosClient jogos={jogos} palpites={palpites ?? []} />
}
