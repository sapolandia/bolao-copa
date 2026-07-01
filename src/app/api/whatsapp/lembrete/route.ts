import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedRequest } from '@/lib/auth-api'
import { sendWhatsAppGroup } from '@/lib/whatsapp'

// Disparado às 11:30 BRT (14:30 UTC) pelo Vercel Cron.
// Envia lembrete para participantes que ainda não enviaram palpites do dia.
export async function POST(req: Request) {
  if (!await isAuthorizedRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Jogos de hoje
  const hoje  = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const amanha = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

  const { data: jogos } = await supabase
    .from('jogos')
    .select('id, mandante, visitante')
    .gte('kickoff_at', `${hoje}T00:00:00-03:00`)
    .lt('kickoff_at', `${amanha}T00:00:00-03:00`)
    .eq('status', 'agendado')

  if (!jogos?.length) {
    return NextResponse.json({ ok: true, msg: 'Nenhum jogo hoje' })
  }

  // Todos os participantes com telefone
  const { data: participantes } = await supabase
    .from('participantes')
    .select('id, nome, telefone')
    .not('telefone', 'is', null)

  if (!participantes?.length) {
    return NextResponse.json({ ok: true, msg: 'Nenhum participante com telefone' })
  }

  const jogosIds = jogos.map((j) => j.id)

  // Quem já enviou palpite para TODOS os jogos de hoje
  const { data: palpitesEnviados } = await supabase
    .from('palpites')
    .select('participante_id, jogo_id')
    .in('jogo_id', jogosIds)

  const enviouTodos = new Set<string>()
  for (const par of participantes) {
    const enviados = (palpitesEnviados ?? []).filter((p) => p.participante_id === par.id)
    if (enviados.length >= jogos.length) enviouTodos.add(par.id)
  }

  const pendentes = participantes.filter((p) => !enviouTodos.has(p.id) && p.telefone)

  const GROUP_ID = '120363427075459931'

  const listaJogos   = jogos.map((j) => `• ${j.mandante} x ${j.visitante}`).join('\n')
  const listaPendentes = pendentes.map((p) => `• ${p.nome}`).join('\n')

  const msg =
    `⚽ *Bolão Copa 2026* — lembrete!\n\n` +
    `*Jogos de hoje:*\n${listaJogos}\n\n` +
    `⏰ Palpites encerram às *12h00*.\n\n` +
    (pendentes.length > 0
      ? `*Ainda não palpitaram:*\n${listaPendentes}\n\n`
      : `✅ Todo mundo já palpitou!\n\n`) +
    `Acesse: ${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/palpites`

  try {
    await sendWhatsAppGroup(GROUP_ID, msg)
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }

  return NextResponse.json({ ok: true, pendentes: pendentes.length, nomes: pendentes.map(p => p.nome) })
}
