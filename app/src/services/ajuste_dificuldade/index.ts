/**
 * ajuste_dificuldade — D-40 (doc/definições002.MD §14): depois de 2+
 * erros somados numa rodada (qualquer desafio, não só um específico), a
 * PRÓXIMA rodada nasce sugerida 1 nível abaixo — nunca a atual. Reduz
 * frustração prospectivamente, sem mascarar retroativamente o que já
 * foi errado (isso é o que D-39 evita ao revogar D-10 — ver
 * `avaliacao_leitura` e `MontagemPalavra` pra tolerância/erro na
 * rodada em curso).
 *
 * Só a função pura mora aqui — persistir a sugestão em
 * `configuracao.ultimo_nivel` depende do serviço `configuracao` (T046,
 * Fase 5/US3, ainda não implementado).
 */

export const LIMITE_ERROS_PARA_FACILITAR = 2;
const NIVEL_MINIMO = 1;

export function sugerirProximoNivel(nivelAtual: number, errosNaRodada: number): number {
  if (errosNaRodada < LIMITE_ERROS_PARA_FACILITAR) {
    return nivelAtual;
  }
  return Math.max(NIVEL_MINIMO, nivelAtual - 1);
}
