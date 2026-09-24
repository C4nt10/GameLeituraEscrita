import type { Modalidade, RegistroHistorico, TipoRodada } from '../../models/registro_historico';

/**
 * resumo_historico — resumo geral do histórico (US4 cenário 4): total,
 * precisão média, média de estrelas por perfil, **sem cruzar
 * modalidades** (D-20 — estrelas/precisão de modalidades diferentes
 * medem habilidades diferentes). Agrupa por `modalidade` pra leitura
 * (Ditado/Leitura·montar/Leitura·voz); matemática forma um grupo único
 * (pura e contextualizada avaliam a mesma habilidade de conta, D-20 não
 * as distingue como mede coisas diferentes — só as 3 modalidades de
 * leitura são citadas explicitamente).
 *
 * Só conta rodadas `concluida: true` — abandonadas não aparecem no
 * histórico (`data-model.md`, mesma regra de `historico/regras.ts`).
 */

export interface ResumoGrupo {
  tipo: TipoRodada;
  /** `null` pra grupo de matemática (sem modalidade, D-19). */
  modalidade: Modalidade | null;
  total: number;
  precisaoMedia: number;
  estrelaMedia: number;
}

function chaveGrupo(r: RegistroHistorico): string {
  return r.tipo === 'matematica' ? 'matematica' : `leitura:${r.modalidade}`;
}

export function calcularResumoHistorico(rodadas: RegistroHistorico[]): ResumoGrupo[] {
  const concluidas = rodadas.filter((r) => r.concluida);
  const porGrupo = new Map<string, RegistroHistorico[]>();

  for (const rodada of concluidas) {
    const chave = chaveGrupo(rodada);
    const grupo = porGrupo.get(chave) ?? [];
    grupo.push(rodada);
    porGrupo.set(chave, grupo);
  }

  return [...porGrupo.values()].map((grupo) => ({
    tipo: grupo[0].tipo,
    modalidade: grupo[0].modalidade,
    total: grupo.length,
    precisaoMedia: grupo.reduce((soma, r) => soma + r.precisao, 0) / grupo.length,
    estrelaMedia: grupo.reduce((soma, r) => soma + r.estrelas, 0) / grupo.length,
  }));
}
