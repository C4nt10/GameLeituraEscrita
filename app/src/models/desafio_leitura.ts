import type { Classificacao, Modalidade } from './registro_historico';
import type { ItemLeitura } from '../services/banco_de_conteudo';

/**
 * DesafioLeitura — spec.md "Key Entities": uma unidade de conteúdo
 * (letra, sílaba, palavra ou frase) associada a nível, classificação(ões)
 * e **modalidade jogada**. Diferente de `ItemLeitura` (o registro estático
 * do banco de conteúdo): o desafio é a instância apresentada numa rodada
 * específica, carregando em qual modalidade ela está sendo jogada — o
 * mesmo item do banco pode virar um desafio de Ditado hoje e de
 * Leitura·voz amanhã.
 */
export interface DesafioLeitura {
  palavra: string;
  nivel: number;
  /** `null` só no nível 1 — letra isolada não tem tema (D-22). */
  classificacoes: Classificacao[] | null;
  modalidade: Modalidade;
  /** Opcional, só documental — não afeta mecânica no MVP (doc002 §6). */
  marcadorFonetico?: string;
}

export function criarDesafioLeitura(item: ItemLeitura, modalidade: Modalidade): DesafioLeitura {
  return {
    palavra: item.palavra,
    nivel: item.nivel,
    classificacoes:
      item.classificacoes && item.classificacoes.length > 0 ? item.classificacoes : null,
    modalidade,
    marcadorFonetico: item.marcador_fonetico,
  };
}
