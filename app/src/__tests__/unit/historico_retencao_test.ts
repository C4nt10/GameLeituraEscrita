import { aplicarRetencao, LIMITE_RODADAS_POR_PERFIL } from '../../services/historico/regras';
import type { RegistroHistorico } from '../../models/registro_historico';

function rodadaFake(overrides: Partial<RegistroHistorico> & { id: string }): RegistroHistorico {
  return {
    perfilId: 'padrao',
    tipo: 'leitura',
    modalidade: 'leitura_montar',
    formaMatematica: null,
    nivel: 2,
    classificacoes: ['animais'],
    tamanho: 5,
    iniciadaEm: '2026-01-01T00:00:00.000Z',
    concluidaEm: '2026-01-01T00:05:00.000Z',
    concluida: true,
    acertos: 5,
    erros: 0,
    precisao: 1,
    estrelas: 5,
    contadorAjuda: 0,
    ...overrides,
  };
}

function rodadasConcluidas(quantidade: number, perfilId = 'padrao'): RegistroHistorico[] {
  return Array.from({ length: quantidade }, (_, i) =>
    rodadaFake({
      id: `r${i}`,
      perfilId,
      iniciadaEm: new Date(2026, 0, i + 1).toISOString(),
    }),
  );
}

describe('historico — retenção de 50 rodadas por perfil (FR-015)', () => {
  it('LIMITE_RODADAS_POR_PERFIL é 50', () => {
    expect(LIMITE_RODADAS_POR_PERFIL).toBe(50);
  });

  it('ao inserir a 51ª rodada concluída, a mais antiga é removida', () => {
    const existentes = rodadasConcluidas(50);
    const novaRodada = rodadaFake({
      id: 'r50-nova',
      iniciadaEm: new Date(2026, 1, 20).toISOString(),
    });

    const resultado = aplicarRetencao(existentes, novaRodada);

    expect(resultado.rodadas).toHaveLength(50);
    expect(resultado.removida?.id).toBe('r0'); // a mais antiga
    expect(resultado.rodadas.find((r) => r.id === 'r0')).toBeUndefined();
    expect(resultado.rodadas.find((r) => r.id === 'r50-nova')).toBeDefined();
  });

  it('abaixo do limite, nenhuma rodada é removida', () => {
    const existentes = rodadasConcluidas(10);
    const novaRodada = rodadaFake({ id: 'r10-nova' });

    const resultado = aplicarRetencao(existentes, novaRodada);

    expect(resultado.rodadas).toHaveLength(11);
    expect(resultado.removida).toBeNull();
  });

  it('rodada abandonada (concluida = false) não conta pro limite nem dispara remoção', () => {
    const existentes = rodadasConcluidas(50);
    const rodadaAbandonada = rodadaFake({
      id: 'abandonada',
      concluida: false,
      concluidaEm: null,
    });

    const resultado = aplicarRetencao(existentes, rodadaAbandonada);

    // a abandonada entra na lista (fica registrada), mas não desloca
    // nenhuma concluída — regra do data-model.md: "abandonadas não contam
    // para o limite nem aparecem no histórico"
    expect(resultado.removida).toBeNull();
    expect(resultado.rodadas.filter((r) => r.concluida)).toHaveLength(50);
  });

  it('retenção é por perfil — rodadas de outro perfil não são contadas nem removidas', () => {
    const doPerfilPadrao = rodadasConcluidas(50, 'padrao');
    const deOutroPerfil = rodadasConcluidas(5, 'outro-perfil');
    const existentes = [...doPerfilPadrao, ...deOutroPerfil];

    const novaRodada = rodadaFake({ id: 'nova-padrao', perfilId: 'padrao' });

    const resultado = aplicarRetencao(existentes, novaRodada);

    expect(resultado.rodadas.filter((r) => r.perfilId === 'outro-perfil')).toHaveLength(5);
    expect(resultado.rodadas.filter((r) => r.perfilId === 'padrao' && r.concluida)).toHaveLength(
      50,
    );
  });
});
