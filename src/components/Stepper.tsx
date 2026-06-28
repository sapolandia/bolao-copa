'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'

interface StepperProps {
  val: number
  set: (v: number) => void
  max?: number
  disabled?: boolean
}

export function Stepper({ val, set, max = 19, disabled = false }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        className="w-8 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--score)] hover:bg-[rgba(255,203,46,.08)] rounded-lg transition-all disabled:opacity-25 disabled:cursor-default"
        onClick={() => set(Math.min(max, val + 1))}
        disabled={disabled || val >= max}
        aria-label="aumentar"
        type="button"
      >
        <ChevronUp size={18} />
      </button>
      <span className="font-mono-custom text-[38px] font-bold text-[var(--score)] w-10 text-center leading-tight" style={{ textShadow: '0 0 16px rgba(255,203,46,.35)' }}>
        {val}
      </span>
      <button
        className="w-8 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--score)] hover:bg-[rgba(255,203,46,.08)] rounded-lg transition-all disabled:opacity-25 disabled:cursor-default"
        onClick={() => set(Math.max(0, val - 1))}
        disabled={disabled || val <= 0}
        aria-label="diminuir"
        type="button"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  )
}
