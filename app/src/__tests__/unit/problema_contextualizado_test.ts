import { gerarProblemaContextualizado } from '../../services/problema_contextualizado';
import type { TemaMatematica } from '../../services/problema_contextualizado';

const TEMA_TESTE: TemaMatematica = {
  classificacao: 'animais',
  objeto: 'passarinho',
  variacoes_frase: {
    soma: ['{x} {objeto}, e mais {y} {objeto}', 'junte {x} com {y} {objeto}'],
    subtracao: ['tinha {x} {objeto}, {y} saíram', 'de {x} {objeto}, sumiram {y}'],
  },
};

describe('problema_contextualizado — nunca gera resultado negativo (FR-009)', () => {
  it('subtração contextualizada, em qualquer nível com subtração, nunca é negativa', () => {
    for (let i = 0; i < 30; i++) {
      const desafio = gerarProblemaContextualizado(4, 'animais', Math.random, [TEMA_TESTE]);
      if (desafio.operacao === 'subtracao') {
        expect(desafio.resultado).toBeGreaterThan(0);
      }
    }
  });

  it('nível 5 (multiplicação) não tem forma contextualizada — lança erro claro, não silencioso', () => {
    expect(() => gerarProblemaContextualizado(5, 'animais', Math.random, [TEMA_TESTE])).toThrow();
  });

  it('enunciado usa o objeto do tema e os operandos sorteados, sem placeholder sobrando', () => {
    const desafio = gerarProblemaContextualizado(1, 'animais', Math.random, [TEMA_TESTE]);
    expect(desafio.enunciado).toBeDefined();
    expect(desafio.enunciado).toEqual(expect.stringContaining('passarinho'));
    expect(desafio.enunciado).not.toEqual(expect.stringContaining('{'));
  });
});
