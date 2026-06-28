import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bolão dos Amigos · Copa 2026',
  description: 'Faça seus palpites, acompanhe o ranking e torça junto.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
