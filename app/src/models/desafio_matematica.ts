import type { Classificacao } from './registro_historico';

/**
 * DesafioMatematica — spec.md "Key Entities": uma conta (operação,
 * operandos, resultado) com forma (pura ou contextualizada), tema
 * (quando contextualizada) e as 4 alternativas geradas. Nunca
 * persistido individualmente — só o agregado da rodada (data-model.md).
 */

export type Operacao = 'soma' | 'subtracao' | 'multiplicacao';
export type FormaMatematica = 'pura' | 'contextualizada';

export interface DesafioMatematica {
  operacao: Operacao;
  operandoA: number;
  operandoB: number;
  resultado: number;
  forma: FormaMatematica;
  /** Presente só quando `forma = 'contextualizada'` (D-23). */
  classificacao?: Classificacao;
  /** Enunciado falado, presente só quando `forma = 'contextualizada'`. */
  enunciado?: string;
  /** Sempre 4, inclui `resultado` (FR-006, doc001 §4). */
  alternativas: number[];
}
