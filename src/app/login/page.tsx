import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-stretch">
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12"
        style={{ background: 'linear-gradient(135deg, var(--surface2) 0%, var(--ink) 100%)', borderRight: '1px solid var(--line)' }}>
        <div>
          <div className="text-[13px] tracking-[.42em] text-[var(--mint)] font-bold uppercase">Copa 2026</div>
          <h1 className="text-[72px] font-black leading-[.9] tracking-tight mt-4">
            Bo<span style={{ color: 'var(--score)' }}>lão</span><br />dos<br />amigos
          </h1>
          <p className="text-[var(--muted)] text-lg mt-6 max-w-xs leading-relaxed">
            Um palpite por jogo, escondido até o meio-dia. Sem planilha, sem print no grupo.
          </p>
        </div>
        <div className="text-[var(--muted)] text-sm">Só entra quem foi convidado pelo organizador.</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
