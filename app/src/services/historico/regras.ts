import type { RegistroHistorico } from '../../models/registro_historico';

/**
 * Regra de retenção do histórico (FR-015, data-model.md tabela `rodadas`),
 * isolada como função pura pra ser testável sem depender de `expo-sqlite`
 * (módulo nativo, não roda em Jest — a persistência de verdade fica em
 * `historico/index.ts`, que chama esta função).
 */

export const LIMITE_RODADAS_POR_PERFIL = 50;

export interface ResultadoRetencao {
  rodadas: RegistroHistorico[];
  /** A rodada removida por estourar o limite, ou `null` se nada foi removido. */
  removida: RegistroHistorico | null;
}

/**
 * Insere `novaRodada` em `rodadasExistentes` e, se isso fizer o perfil
 * dela ultrapassar `limite` rodadas **concluídas**, remove a concluída
 * mais antiga desse mesmo perfil. Rodadas abandonadas (`concluida =
 * false`) nunca contam pro limite nem disparam remoção — só ficam
 * registradas (data-model.md).
 */
export function aplicarRetencao(
  rodadasExistentes: RegistroHistorico[],
  novaRodada: RegistroHistorico,
  limite: number = LIMITE_RODADAS_POR_PERFIL,
): ResultadoRetencao {
  const rodadas = [...rodadasExistentes, novaRodada];

  if (!novaRodada.concluida) {
    return { rodadas, removida: null };
  }

  const concluidasDoPerfil = rodadas
    .filter((r) => r.perfilId === novaRodada.perfilId && r.concluida)
    .sort((a, b) => a.iniciadaEm.localeCompare(b.iniciadaEm));

  if (concluidasDoPerfil.length <= limite) {
    return { rodadas, removida: null };
  }

  const maisAntiga = concluidasDoPerfil[0];

  return {
    rodadas: rodadas.filter((r) => r.id !== maisAntiga.id),
    removida: maisAntiga,
  };
}
