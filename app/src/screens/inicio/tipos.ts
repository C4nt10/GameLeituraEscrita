import type { Classificacao, FormaMatematica, Modalidade } from '../../models/registro_historico';

/**
 * O que a tela inicial entrega ao começar uma rodada. Moram aqui desde que a
 * `TelaConfiguracao` antiga saiu (T118) — a forma dos dados não mudou.
 */
export type Tipo = 'leitura' | 'matematica' | 'misto';
export type Formato = 'sozinho' | 'dupla';
export type FormatoDupla = 'cooperativo' | 'adversarial';

export interface EscolhaRodada {
  tipo: Tipo;
  modalidade: Modalidade;
  /**
   * Nível **do tipo escolhido**: de matemática (1–8) quando `tipo =
   * 'matematica'`, de leitura (1–5) nos demais — os dois são independentes
   * e persistidos separado (D-43).
   */
  nivel: number;
  /** `null` = "todas" (padrão) ou nível 1 (sem classificação, D-22). */
  classificacao: Classificacao | null;
  formaMatematica: FormaMatematica;
  tamanho: 3 | 5 | 8;
  formato: Formato;
  /** Obrigatório quando `formato = 'dupla'` — nenhum formato é padrão implícito (D-31/T057). */
  formatoDupla: FormatoDupla | null;
}
