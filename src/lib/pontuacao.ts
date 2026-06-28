import type { Jogo, Palpite } from '@/types'

// Regras:
// • 3 pts para placar exato
// • 1 pt para resultado certo (quem ganhou ou empate)
// • Sempre tempo regulamentar (90 min) — prorrogação e pênaltis ignorados
// • Campeão da Copa = +10 pts (calculado separado no banco)
export function calcularPontos(jogo: Jogo, palpite: Palpite): number {
  if (jogo.placar_mandante === null || jogo.placar_visitante === null) return 0

  if (
    palpite.placar_mandante === jogo.placar_mandante &&
    palpite.placar_visitante === jogo.placar_visitante
  ) return 3

  const resultadoReal  = Math.sign(jogo.placar_mandante - jogo.placar_visitante)
  const resultadoPalp  = Math.sign(palpite.placar_mandante - palpite.placar_visitante)
  if (resultadoReal === resultadoPalp) return 1

  return 0
}

// Deadline fixo: meio-dia (12:00) de São Paulo no dia do jogo
export function deadlineHoje(): Date {
  const now = new Date()
  // Data de hoje em São Paulo (UTC-3)
  const sp = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const deadline = new Date(sp)
  deadline.setHours(12, 0, 0, 0)
  // Converter de volta para UTC
  const offset = -3 * 60 // UTC-3 em minutos
  deadline.setMinutes(deadline.getMinutes() - offset - (sp.getTimezoneOffset()))
  return deadline
}

export function palpitesTravados(): boolean {
  return new Date() >= deadlineHoje()
}

// Para compatibilidade com o código existente
export function calcularTrava(_jogos: Jogo[]): Date {
  return deadlineHoje()
}
