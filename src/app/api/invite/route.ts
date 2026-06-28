import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  // Só admin pode convidar
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: par } = await supabase.from('participantes').select('is_admin').eq('id', user.id).single()
  if (!par?.is_admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { email, nome, telefone } = await req.json() as { email: string; nome: string; telefone?: string }
  if (!email || !nome) return NextResponse.json({ error: 'email e nome são obrigatórios' }, { status: 400 })

  const service = createServiceClient()

  // 1. Adiciona à allowlist de convidados
  await service.from('convidados').upsert({ email: email.toLowerCase() }, { onConflict: 'email' })

  // 2. Envia convite pelo Supabase (e-mail com link para definir senha)
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/convite`,
    data: { nome },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. Cria/atualiza participante com nome e telefone
  if (data.user) {
    await service.from('participantes').upsert({
      id: data.user.id,
      nome,
      email: email.toLowerCase(),
      telefone: telefone ?? null,
    }, { onConflict: 'id' })
  }

  return NextResponse.json({ ok: true, email })
}
