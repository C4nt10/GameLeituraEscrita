/**
 * alternativas_letra — gera as 4 alternativas de um desafio de Ditado
 * nível 1 (FR-006, D-03): sempre 4, nunca repetidas, incluindo a certa.
 */

const QUANTIDADE_ALTERNATIVAS = 4;

function embaralhar<T>(itens: T[], aleatorio: () => number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * @param correta A letra certa do desafio.
 * @param candidatas Pool de letras possíveis (tipicamente o alfabeto, ou
 *   as letras presentes no banco de conteúdo nível 1) — precisa ter pelo
 *   menos 3 letras diferentes de `correta`.
 * @param aleatorio Gerador de número aleatório 0-1, injetável pra teste
 *   determinístico. Default `Math.random`.
 */
export function gerarAlternativasLetra(
  correta: string,
  candidatas: string[],
  aleatorio: () => number = Math.random,
): string[] {
  const pool = candidatas.filter((c) => c !== correta);
  const poolUnico = [...new Set(pool)];

  if (poolUnico.length < QUANTIDADE_ALTERNATIVAS - 1) {
    throw new Error(
      `Letras insuficientes pra gerar ${QUANTIDADE_ALTERNATIVAS} alternativas: só ${poolUnico.length} candidata(s) diferente(s) de "${correta}".`,
    );
  }

  const erradas = embaralhar(poolUnico, aleatorio).slice(0, QUANTIDADE_ALTERNATIVAS - 1);
  return embaralhar([correta, ...erradas], aleatorio);
}
