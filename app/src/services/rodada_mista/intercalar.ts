export type TipoDoItemMisto = 'leitura' | 'matematica';

/**
 * Ordem de uma rodada Misturada (D-57): `qtdLeitura` itens de leitura e
 * `qtdMatematica` de matemática, intercalados o mais uniforme possível —
 * nunca "esgota um tipo e despeja o resto do outro no final". `comecaLeitura`
 * decide quem vem primeiro em caso de empate (inclusive na alternância
 * estrita, quando as duas quantidades são iguais).
 *
 * Algoritmo: a cada passo, escolhe o tipo cuja proporção já consumida
 * (itens usados / total do tipo) está mais atrasada — é o mesmo princípio
 * do algoritmo de Bresenham pra distribuir dois ritmos diferentes o mais
 * igual possível.
 */
export function ordemIntercalada(
  qtdLeitura: number,
  qtdMatematica: number,
  comecaLeitura: boolean,
): TipoDoItemMisto[] {
  const ordem: TipoDoItemMisto[] = [];
  let l = 0;
  let m = 0;

  while (l < qtdLeitura || m < qtdMatematica) {
    const podeLeitura = l < qtdLeitura;
    const podeMatematica = m < qtdMatematica;

    let escolhido: TipoDoItemMisto;
    if (podeLeitura && !podeMatematica) {
      escolhido = 'leitura';
    } else if (!podeLeitura && podeMatematica) {
      escolhido = 'matematica';
    } else {
      const proporcaoLeitura = l / qtdLeitura;
      const proporcaoMatematica = m / qtdMatematica;
      if (proporcaoLeitura < proporcaoMatematica) escolhido = 'leitura';
      else if (proporcaoMatematica < proporcaoLeitura) escolhido = 'matematica';
      else escolhido = comecaLeitura ? 'leitura' : 'matematica';
    }

    ordem.push(escolhido);
    if (escolhido === 'leitura') l++;
    else m++;
  }

  return ordem;
}
