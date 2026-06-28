import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/palpites'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Se é um convite (sem senha definida), redireciona para definir senha
      const isInvite = data.user.user_metadata?.invited_at || !data.user.last_sign_in_at
      if (isInvite) {
        return NextResponse.redirect(`${origin}/convite`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
