import { TabBar, SideNav } from '@/components/TabBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: participante } = await supabase
    .from('participantes')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = participante?.is_admin === true

  return (
    <div className="min-h-screen flex flex-col">
      <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-[var(--line)]">
        <Link href="/palpites" className="flex items-center gap-2 font-black text-lg">
          <Trophy size={20} className="text-[var(--score)]" />
          <span>Bolão <span className="text-[var(--score)]">Copa 2026</span></span>
        </Link>
        <LogoutButton />
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 gap-8">
        <SideNav isAdmin={isAdmin} />
        <main className="flex-1 py-6 pb-24 md:pb-8 min-w-0">
          {children}
        </main>
      </div>

      <TabBar isAdmin={isAdmin} />
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/auth/logout" method="post">
      <button type="submit" className="text-[var(--muted)] text-sm hover:text-[var(--chalk)] transition-colors">
        Sair
      </button>
    </form>
  )
}
