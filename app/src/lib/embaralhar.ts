/** Fisher-Yates. Compartilhado por alternativas_letra, MontagemPalavra e banco_de_conteudo. */
export function embaralhar<T>(itens: T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
