/**
 * avaliacao — cálculo de precisão/estrelas de uma rodada (D-06, D-20,
 * FR-007, CU-05). A função é sempre sobre UMA rodada de UMA modalidade —
 * não recebe nem combina dados de outra modalidade, o que é a própria
 * garantia estrutural de D-20 ("estrelas nunca comparadas entre
 * modalidades diferentes"): não há como misturar o que a assinatura não
 * aceita.
 */

export interface ResultadoAvaliacao {
  /** acertos / (acertos + erros), 0 se ainda não houve nenhuma tentativa. */
  precisao: number;
  /** 0-5, granularidade de meia estrela, proporcional à precisão. */
  estrelas: number;
}

const MAXIMO_ESTRELAS = 5;
const GRANULARIDADE = 0.5;

export function calcularResultado(acertos: number, erros: number): ResultadoAvaliacao {
  const tentativas = acertos + erros;
  const precisao = tentativas === 0 ? 0 : acertos / tentativas;
  const estrelas = Math.round((precisao * MAXIMO_ESTRELAS) / GRANULARIDADE) * GRANULARIDADE;

  return { precisao, estrelas };
}
