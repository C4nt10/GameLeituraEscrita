import type { RegistroHistorico } from '../../models/registro_historico';
import {
  ABAS,
  abaDaRodada,
  dataDaRodada,
  resumoDaAba,
  rodadasDaAba,
} from '../../screens/historico/logica';

function rodada(overrides: Partial<RegistroHistorico> & { id: string }): RegistroHistorico {
  return {
    perfilId: 'padrao',
    tipo: 'leitura',
    modalidade: 'ditado',
    formaMatematica: null,
    nivel: 2,
    classificacoes: ['animais'],
    tamanho: 5,
    iniciadaEm: '2026-09-26T10:00:00.000Z',
    concluidaEm: '2026-09-26T10:05:00.000Z',
    concluida: true,
    acertos: 4,
    erros: 1,
    precisao: 0.8,
    estrelas: 4,
    contadorAjuda: 0,
    ...overrides,
  };
}

describe('histórico — abas por jeito de jogar (T114, D-20: sem cruzar modalidades)', () => {
  it('tem as cinco abas na ordem da tela inicial, cada uma com sua cor de modalidade', () => {
    expect(ABAS.map((a) => a.rotulo)).toEqual([
      'Ouvir e montar',
      'Ler e montar',
      'Ler em voz alta',
      'Conta',
      'Historinha',
    ]);
  });

  it('classifica cada rodada na aba do seu jeito de jogar', () => {
    expect(abaDaRodada(rodada({ id: 'a', modalidade: 'ditado' }))).toBe('ditado');
    expect(abaDaRodada(rodada({ id: 'b', modalidade: 'leitura_montar' }))).toBe('leitura_montar');
    expect(abaDaRodada(rodada({ id: 'c', modalidade: 'leitura_voz' }))).toBe('leitura_voz');
    expect(
      abaDaRodada(
        rodada({ id: 'd', tipo: 'matematica', modalidade: null, formaMatematica: 'pura' }),
      ),
    ).toBe('conta');
    expect(
      abaDaRodada(
        rodada({
          id: 'e',
          tipo: 'matematica',
          modalidade: null,
          formaMatematica: 'contextualizada',
        }),
      ),
    ).toBe('historinha');
  });

  it('separa as rodadas por aba e ignora as abandonadas', () => {
    const rodadas = [
      rodada({ id: 'r1', modalidade: 'ditado' }),
      rodada({ id: 'r2', modalidade: 'leitura_voz' }),
      rodada({ id: 'r3', modalidade: 'ditado', concluida: false }),
    ];

    expect(rodadasDaAba(rodadas, 'ditado').map((r) => r.id)).toEqual(['r1']);
    expect(rodadasDaAba(rodadas, 'leitura_voz').map((r) => r.id)).toEqual(['r2']);
    expect(rodadasDaAba(rodadas, 'conta')).toEqual([]);
  });

  it('resume só a aba pedida: total, precisão média e estrelas médias', () => {
    const doDitado = [
      rodada({ id: 'r1', precisao: 1, estrelas: 5 }),
      rodada({ id: 'r2', precisao: 0.5, estrelas: 2.5 }),
    ];

    const resumo = resumoDaAba(doDitado);

    expect(resumo.total).toBe(2);
    expect(resumo.precisaoMedia).toBeCloseTo(0.75);
    expect(resumo.estrelaMedia).toBeCloseTo(3.75);
  });

  it('aba sem rodadas resume em zero — a tela mostra a mensagem, nunca NaN', () => {
    expect(resumoDaAba([])).toEqual({ total: 0, precisaoMedia: 0, estrelaMedia: 0 });
  });
});

describe('histórico — data da rodada em texto curto', () => {
  const agora = new Date(2026, 8, 26, 15, 0); // 26/set/2026, horário local

  it('mesmo dia vira "hoje"', () => {
    expect(dataDaRodada(new Date(2026, 8, 26, 9, 30).toISOString(), agora)).toBe('hoje');
  });

  it('dia anterior vira "ontem"', () => {
    expect(dataDaRodada(new Date(2026, 8, 25, 23, 59).toISOString(), agora)).toBe('ontem');
  });

  it('antes disso vira dia e mês abreviado, em português', () => {
    expect(dataDaRodada(new Date(2026, 8, 3, 8, 0).toISOString(), agora)).toBe('3 set');
    expect(dataDaRodada(new Date(2026, 0, 15, 8, 0).toISOString(), agora)).toBe('15 jan');
  });
});
