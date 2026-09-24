import itensLeituraAsset from '../../../assets/conteudo/leitura.json';
import type { Classificacao } from '../../models/registro_historico';

/**
 * banco_de_conteudo — carrega a grade nível×classificação do asset
 * `app/assets/conteudo/leitura.json` e valida que toda combinação exposta
 * na configuração da rodada tem conteúdo suficiente (FR-010, FR-011,
 * D-35 — data-model.md "Regra de validação cruzada").
 */

export interface ItemLeitura {
  palavra: string;
  nivel: number;
  classificacoes?: Classificacao[];
  marcador_fonetico?: string;
}

export interface CombinacaoDisponivel {
  nivel: number;
  /** `null` só no nível 1 — letra isolada não tem tema (D-22). */
  classificacao: Classificacao | null;
  quantidade: number;
}

/** D-35: 12, não 8 (o tamanho máximo de rodada) — folga pra não repetir sempre a mesma sequência. */
export const MINIMO_PALAVRAS_POR_COMBINACAO = 12;

const itensReais = itensLeituraAsset as ItemLeitura[];

export function itensDoBanco(): ItemLeitura[] {
  return itensReais;
}

function contarPorCombinacao(itens: ItemLeitura[]): Map<string, number> {
  const contagem = new Map<string, number>();

  for (const item of itens) {
    if (item.nivel === 1) {
      const chave = chaveCombinacao(1, null);
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
      continue;
    }

    for (const classificacao of item.classificacoes ?? []) {
      const chave = chaveCombinacao(item.nivel, classificacao);
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
  }

  return contagem;
}

function chaveCombinacao(nivel: number, classificacao: Classificacao | null): string {
  return `${nivel}::${classificacao ?? ''}`;
}

/**
 * Combinações nível×classificação com pelo menos
 * `MINIMO_PALAVRAS_POR_COMBINACAO` itens — as únicas que a tela de
 * configuração (US3) pode oferecer (FR-011).
 */
export function combinacoesDisponiveis(itens: ItemLeitura[] = itensReais): CombinacaoDisponivel[] {
  const contagem = contarPorCombinacao(itens);
  const disponiveis: CombinacaoDisponivel[] = [];

  for (const [chave, quantidade] of contagem) {
    if (quantidade < MINIMO_PALAVRAS_POR_COMBINACAO) continue;

    const [nivelTexto, classificacaoTexto] = chave.split('::');
    disponiveis.push({
      nivel: Number(nivelTexto),
      classificacao: classificacaoTexto === '' ? null : (classificacaoTexto as Classificacao),
      quantidade,
    });
  }

  return disponiveis;
}

export function combinacaoTemConteudoSuficiente(
  itens: ItemLeitura[],
  nivel: number,
  classificacao: Classificacao | null,
): boolean {
  const disponivel = combinacoesDisponiveis(itens).find(
    (c) => c.nivel === nivel && c.classificacao === classificacao,
  );
  return disponivel !== undefined;
}
