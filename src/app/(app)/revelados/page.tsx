import { createClient } from '@/lib/supabase/server'
import { ReveladosClient } from './ReveladosClient'

export default async function ReveladosPage() {
  const supabase = await createClient()

  // Deadline de hoje: 12:00 BRT = 15:00 UTC
  const agora = new Date()
  const hoje  = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) // YYYY-MM-DD
  const deadline = new Date(`${hoje}T15:00:00Z`) // 12:00 BRT em UTC

  const prazoPassou = agora >= deadline

  // Mostrar jogos cujo prazo de palpite já passou:
  //   - jogos encerrados (qualquer fase)
  //   - OU jogos de hoje se já passou das 12h (para revelar antes de terminar)
  let query = supabase
    .from('jogos')
    .select('*')
    .order('kickoff_at', { ascending: false })

  if (prazoPassou) {
    // Jogos encerrados em qualquer data + jogos de hoje após o prazo
    query = query.or(`status.eq.encerrado,kickoff_at.gte.${hoje}T00:00:00-03:00`)
  } else {
    // Antes do prazo: só jogos já encerrados de dias anteriores
    query = query.eq('status', 'encerrado').lt('kickoff_at', `${hoje}T00:00:00-03:00`)
  }

  const { data: jogos } = await query

  if (!jogos?.length) {
    const msg = prazoPassou
      ? 'Ninguém enviou palpite para os jogos de hoje.'
      : 'Os palpites de hoje serão revelados após as 12h.'

    return (
      <div>
        <div className="mb-5">
          <div className="text-[11px] tracking-[.18em] uppercase text-[var(--muted)] font-semibold">Palpites revelados</div>
          <h1 className="text-[24px] font-black mt-1">Jogos encerrados</h1>
        </div>
        <div className="rounded-2xl p-8 text-center text-[var(--muted)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          {msg}
        </div>
      </div>
    )
  }

  const { data: palpites } = await supabase
    .from('palpites')
    .select('*, participantes(nome)')
    .in('jogo_id', jogos.map((j) => j.id))

  return <ReveladosClient jogos={jogos} palpites={palpites ?? []} />
}
