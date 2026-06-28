export type Fase = 'grupos' | 'oitavas' | 'quartas' | 'semi' | 'terceiro' | 'final'

export interface Time {
  codigo: string
  nome: string
  bandeira: string
}

export interface Jogo {
  id: string
  fase: Fase
  mandante: string
  visitante: string
  logo_mandante: string | null
  logo_visitante: string | null
  kickoff_at: string
  placar_mandante: number | null
  placar_visitante: number | null
  classificado: string | null
  status: 'agendado' | 'encerrado'
}

export interface Participante {
  id: string
  nome: string
  email: string
  is_admin: boolean
}

export interface Palpite {
  id: string
  participante_id: string
  jogo_id: string
  placar_mandante: number
  placar_visitante: number
  classificado: string | null
  created_at: string
  updated_at: string
}

export interface PalpiteArtilheiro {
  id: string
  participante_id: string
  jogador: string
  created_at: string
}

export interface PalpiteComPontos extends Palpite {
  pontos: number
  participante?: Participante
}

export interface EntradaRanking {
  participante: Participante
  pontos: number
  placares_exatos: number
  acertos_resultado: number
  posicao: number
}
