import { calcularResumoHistorico } from '../../services/resumo_historico';
import type { RegistroHistorico } from '../../models/registro_historico';

function rodada(overrides: Partial<RegistroHistorico> & { id: string }): RegistroHistorico {
  return {
    perfilId: 'padrao',
    tipo: 'leitura',
    modalidade: 'ditado',
    formaMatematica: null,
    nivel: 2,
    classificacoes: ['animais'],
    tamanho: 5,
    iniciadaEm: '2026-01-01T00:00:00.000Z',
    concluidaEm: '2026-01-01T00:05:00.000Z',
    concluida: true,
    acertos: 4,
    erros: 1,
    precisao: 0.8,
    estrelas: 4,
    contadorAjuda: 0,
    ...overrides,
  };
}

describe('resumo_historico — resumo geral por perfil, sem cruzar modalidades (US4 cenário 4, D-20)', () => {
  it('agrupa por modalidade — Ditado e Leitura·voz não se misturam num só número', () => {
    const rodadas = [
      rodada({ id: 'r1', modalidade: 'ditado', precisao: 1, estrelas: 5 }),
      rodada({ id: 'r2', modalidade: 'ditado', precisao: 0.5, estrelas: 2.5 }),
      rodada({ id: 'r3', modalidade: 'leitura_voz', precisao: 0.2, estrelas: 1 }),
    ];

    const resumo = calcularResumoHistorico(rodadas);

    const grupoDitado = resumo.find((g) => g.modalidade === 'ditado');
    const grupoVoz = resumo.find((g) => g.modalidade === 'leitura_voz');

    expect(grupoDitado?.total).toBe(2);
    expect(grupoDitado?.precisaoMedia).toBeCloseTo(0.75); // (1 + 0.5) / 2
    expect(grupoDitado?.estrelaMedia).toBeCloseTo(3.75); // (5 + 2.5) / 2

    expect(grupoVoz?.total).toBe(1);
    expect(grupoVoz?.precisaoMedia).toBeCloseTo(0.2);
  });

  it('matemática forma um grupo próprio (tipo "matematica", modalidade null)', () => {
    const rodadas = [
      rodada({
        id: 'm1',
        tipo: 'matematica',
        modalidade: null,
        formaMatematica: 'pura',
        contadorAjuda: null,
        precisao: 0.9,
        estrelas: 4.5,
      }),
    ];

    const resumo = calcularResumoHistorico(rodadas);
    const grupoMatematica = resumo.find((g) => g.tipo === 'matematica');

    expect(grupoMatematica?.total).toBe(1);
    expect(grupoMatematica?.precisaoMedia).toBeCloseTo(0.9);
  });

  it('rodadas não concluídas (abandonadas) não entram no resumo', () => {
    const rodadas = [
      rodada({ id: 'r1', concluida: true, precisao: 1 }),
      rodada({ id: 'r2', concluida: false, precisao: 0, concluidaEm: null }),
    ];

    const resumo = calcularResumoHistorico(rodadas);
    const grupo = resumo.find((g) => g.modalidade === 'ditado');

    expect(grupo?.total).toBe(1);
  });

  it('perfil sem nenhuma rodada concluída devolve resumo vazio, sem dividir por zero', () => {
    const resumo = calcularResumoHistorico([]);
    expect(resumo).toEqual([]);
  });
});
