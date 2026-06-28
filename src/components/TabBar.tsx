'use client'

import { ListChecks, Eye, Trophy, Settings, GitBranch, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/palpites',     label: 'Palpites',     icon: ListChecks  },
  { href: '/revelados',    label: 'Revelados',    icon: Eye         },
  { href: '/chaveamento',  label: 'Chaveamento',  icon: GitBranch   },
  { href: '/ranking',      label: 'Ranking',      icon: Trophy      },
  { href: '/perfil',       label: 'Perfil',       icon: UserCircle  },
]

export function TabBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const path = usePathname()
  const tabs = isAdmin ? [...TABS, { href: '/admin', label: 'Admin', icon: Settings }] : TABS

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--line)] z-50 md:hidden"
      style={{ background: 'rgba(10,19,14,.92)', backdropFilter: 'blur(10px)' }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 pb-4 text-[10.5px] font-bold transition-colors ${active ? 'text-[var(--score)]' : 'text-[var(--muted)]'}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function SideNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const path = usePathname()
  const tabs = isAdmin ? [...TABS, { href: '/admin', label: 'Admin', icon: Settings }] : TABS

  return (
    <aside className="hidden md:flex flex-col gap-1 w-56 shrink-0 pt-8">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${active ? 'text-[var(--score)] bg-[rgba(255,203,46,.08)]' : 'text-[var(--muted)] hover:text-[var(--chalk)] hover:bg-[var(--surface)]'}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
