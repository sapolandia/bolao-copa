import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: par } = await supabase.from('participantes').select('is_admin').eq('id', user.id).single()
  if (!par?.is_admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { jogoId, pm, pv } = await req.json()
  if (!jogoId || pm === undefined || pv === undefined) {
    return NextResponse.json({ error: 'jogoId, pm e pv são obrigatórios' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.from('jogos').update({
    placar_mandante:  pm,
    placar_visitante: pv,
    status:           'encerrado',
    classificado:     null, // não usamos mais
  }).eq('id', jogoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
