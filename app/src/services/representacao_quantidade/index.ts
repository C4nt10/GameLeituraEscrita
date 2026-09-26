/**
 * representacao_quantidade — D-42 (doc/definições002.MD §15): como
 * desenhar uma quantidade pra criança contar/enxergar, sem exigir
 * material físico. Função pura de propósito: a decisão "quantas
 * bolinhas em cada linha", "quantas barras e cubinhos" é testada sem
 * renderizar nada; `QuantidadeVisual` só desenha o que esta função manda.
 *
 * - até 10 → bolinhas em linhas de 5 (5 é o que a criança conta de uma vez);
 * - de 11 a 20 → estilo material dourado: barra = 10, cubinho = 1;
 * - nível 8 (multiplicação) → N grupos de M objetos.
 *
 * Só exibição — nenhuma interação (A-16: material dourado interativo
 * ficou fora do MVP).
 */

const OBJETOS_POR_LINHA = 5;
const QUANTIDADE_MAXIMA = 20;

export type RepresentacaoQuantidade =
  | { tipo: 'bolinhas'; linhas: number[] }
  | { tipo: 'dourado'; dezenas: number; unidades: number }
  | { tipo: 'grupos'; grupos: number; porGrupo: number };

export function representarQuantidade(quantidade: number): RepresentacaoQuantidade {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > QUANTIDADE_MAXIMA) {
    throw new Error(
      `Quantidade inválida pra representar: ${quantidade} (esperado inteiro de 1 a 20).`,
    );
  }

  if (quantidade <= 10) {
    const linhas: number[] = [];
    for (let restante = quantidade; restante > 0; restante -= OBJETOS_POR_LINHA) {
      linhas.push(Math.min(OBJETOS_POR_LINHA, restante));
    }
    return { tipo: 'bolinhas', linhas };
  }

  return { tipo: 'dourado', dezenas: Math.floor(quantidade / 10), unidades: quantidade % 10 };
}

export function representarGrupos(grupos: number, porGrupo: number): RepresentacaoQuantidade {
  if (!Number.isInteger(grupos) || grupos < 1 || !Number.isInteger(porGrupo) || porGrupo < 1) {
    throw new Error(`Grupos inválidos: ${grupos} grupos de ${porGrupo}.`);
  }
  return { tipo: 'grupos', grupos, porGrupo };
}
