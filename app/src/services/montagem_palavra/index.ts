/**
 * montagem_palavra — regra do toque numa peça, pura (D-06, US1 cenário 5,
 * D-55): a peça certa entra na próxima vaga; qualquer outra é erro, e quem
 * chama conta o erro e limpa a montagem. Não sabe nada de tela.
 */
export type ResultadoDoToque =
  { tipo: 'certo'; preenchidas: string[]; completa: boolean } | { tipo: 'errado' };

export function tocarLetra(
  letras: string[],
  preenchidas: string[],
  letra: string,
): ResultadoDoToque {
  const proximaEsperada = letras[preenchidas.length];
  if (proximaEsperada === undefined || letra !== proximaEsperada) {
    return { tipo: 'errado' };
  }
  const novas = [...preenchidas, letra];
  return { tipo: 'certo', preenchidas: novas, completa: novas.length === letras.length };
}
