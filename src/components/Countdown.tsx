'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  trava: Date
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
}

export function Countdown({ trava }: CountdownProps) {
  const [left, setLeft] = useState(() => Math.max(0, Math.floor((trava.getTime() - Date.now()) / 1000)))

  useEffect(() => {
    const i = setInterval(() => {
      const remaining = Math.max(0, Math.floor((trava.getTime() - Date.now()) / 1000))
      setLeft(remaining)
    }, 1000)
    return () => clearInterval(i)
  }, [trava])

  const travado = left === 0

  return (
    <div className="flex items-center gap-3 rounded-[14px] p-[13px_15px] mb-4 border border-[var(--line)]"
      style={{
        background: 'linear-gradient(180deg, var(--surface2), var(--surface))',
        boxShadow: '0 0 0 1px rgba(255,203,46,.04), 0 14px 30px -22px rgba(255,203,46,.5)',
      }}
    >
      {travado ? (
        <span className="text-[var(--live)] text-xl">🔒</span>
      ) : (
        <span
          className="w-[9px] h-[9px] rounded-full bg-[var(--live)] flex-none animate-pulse-dot"
          style={{ boxShadow: '0 0 0 0 rgba(255,90,77,.6)' }}
        />
      )}
      <div>
        <div className="text-[10px] tracking-[.16em] text-[var(--muted)] uppercase">
          {travado ? 'Palpites travados' : 'Trava em'}
        </div>
        {!travado && (
          <div className="font-mono-custom text-2xl font-bold text-[var(--score)] tracking-[.04em] leading-tight mt-0.5">
            {fmt(left)}
          </div>
        )}
      </div>
    </div>
  )
}
