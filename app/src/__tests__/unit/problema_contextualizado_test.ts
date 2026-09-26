import {
  classificacaoAleatoria,
  gerarProblemaContextualizado,
} from '../../services/problema_contextualizado';
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

  it('nível 8 (multiplicação) não tem forma contextualizada — lança erro claro, não silencioso', () => {
    expect(() => gerarProblemaContextualizado(8, 'animais', Math.random, [TEMA_TESTE])).toThrow();
  });

  it('níveis 1 a 7 sempre geram problema contextualizado (soma/subtração)', () => {
    for (let nivel = 1; nivel <= 7; nivel++) {
      const desafio = gerarProblemaContextualizado(nivel, 'animais', Math.random, [TEMA_TESTE]);
      expect(['soma', 'subtracao']).toContain(desafio.operacao);
      expect(desafio.forma).toBe('contextualizada');
    }
  });

  it('enunciado usa o objeto do tema e os operandos sorteados, sem placeholder sobrando', () => {
    const desafio = gerarProblemaContextualizado(1, 'animais', Math.random, [TEMA_TESTE]);
    expect(desafio.enunciado).toBeDefined();
    expect(desafio.enunciado).toEqual(expect.stringContaining('passarinho'));
    expect(desafio.enunciado).not.toEqual(expect.stringContaining('{'));
  });
});

describe('classificacaoAleatoria — "Problema" sem tema escolhido não pode virar conta pura em silêncio', () => {
  const OUTRO_TEMA: TemaMatematica = { ...TEMA_TESTE, classificacao: 'comida', objeto: 'maçã' };

  it('devolve sempre uma classificação que existe nos temas', () => {
    for (let i = 0; i < 20; i++) {
      expect(['animais', 'comida']).toContain(
        classificacaoAleatoria(Math.random, [TEMA_TESTE, OUTRO_TEMA]),
      );
    }
  });

  it('usa o gerador de números passado (determinístico com seed)', () => {
    expect(classificacaoAleatoria(() => 0, [TEMA_TESTE, OUTRO_TEMA])).toBe('animais');
    expect(classificacaoAleatoria(() => 0.99, [TEMA_TESTE, OUTRO_TEMA])).toBe('comida');
  });

  it('lança erro claro se não houver nenhum tema', () => {
    expect(() => classificacaoAleatoria(Math.random, [])).toThrow();
  });
});
