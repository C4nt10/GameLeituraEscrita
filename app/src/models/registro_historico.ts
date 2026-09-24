/**
 * RegistroHistorico — data-model.md, tabela `rodadas`.
 *
 * Uma linha por rodada individual (sozinha ou uma das duas metades de uma
 * rodada dupla). É, ao mesmo tempo, o "Registro de histórico" do
 * `spec.md` — CU-06 só pede o resumo por rodada, não o log de cada
 * desafio respondido (YAGNI, ver data-model.md).
 */

export type TipoRodada = 'leitura' | 'matematica' | 'misto';
export type Modalidade = 'ditado' | 'leitura_montar' | 'leitura_voz';
export type FormaMatematica = 'pura' | 'contextualizada';
export type Classificacao = 'animais' | 'comida' | 'casa' | 'corpo' | 'natureza' | 'acoes';

export interface RegistroHistorico {
  id: string;
  perfilId: string;
  tipo: TipoRodada;
  /** Obrigatório se `tipo` envolve leitura; nulo se só matemática. */
  modalidade: Modalidade | null;
  /** Obrigatório se `tipo` envolve matemática. */
  formaMatematica: FormaMatematica | null;
  nivel: number; // 1-5
  /** Nulo quando `nivel = 1` (D-22 — letra isolada não tem tema). */
  classificacoes: Classificacao[] | null;
  tamanho: 3 | 5 | 8;
  iniciadaEm: string; // ISO 8601
  /** Nulo enquanto a rodada está em andamento. */
  concluidaEm: string | null;
  /**
   * `false` até o último desafio ser respondido; rodada abandonada fica
   * `false` pra sempre (FR-018 generalizado no edge case do spec.md).
   */
  concluida: boolean;
  acertos: number;
  /** D-06 — toda tentativa errada conta, mesmo em desafios repetidos. */
  erros: number;
  /** `acertos / (acertos + erros)`, calculado ao concluir (D-06). */
  precisao: number;
  /** Granularidade 0.5 (CU-05). */
  estrelas: number;
  /**
   * Significado depende de `modalidade`: repetições (Ditado) / espiadas
   * (Leitura·montar) / tentativas (Leitura·voz) — D-19. Nulo se
   * `tipo = "matematica"`.
   */
  contadorAjuda: number | null;
}
