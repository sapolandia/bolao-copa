import { createClient } from '@/lib/supabase/server'

// Permite acesso se vier com CRON_SECRET ou se o usuário logado for admin.
export async function isAuthorizedRequest(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') === `Bearer ${secret}`) return true
  if (!secret) return true // dev sem CRON_SECRET: permite tudo

  // Fallback: verifica sessão admin no Supabase
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('participantes')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    return data?.is_admin === true
  } catch {
    return false
  }
}
