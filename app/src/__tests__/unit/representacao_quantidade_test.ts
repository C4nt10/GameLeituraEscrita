import { representarGrupos, representarQuantidade } from '../../services/representacao_quantidade';

describe('representacao_quantidade — até 10: bolinhas em linhas de 5 (D-42)', () => {
  it('7 vira uma linha de 5 e uma de 2', () => {
    expect(representarQuantidade(7)).toEqual({ tipo: 'bolinhas', linhas: [5, 2] });
  });

  it('5 é uma linha cheia; 10 são duas linhas cheias', () => {
    expect(representarQuantidade(5)).toEqual({ tipo: 'bolinhas', linhas: [5] });
    expect(representarQuantidade(10)).toEqual({ tipo: 'bolinhas', linhas: [5, 5] });
  });

  it('1 é uma bolinha só', () => {
    expect(representarQuantidade(1)).toEqual({ tipo: 'bolinhas', linhas: [1] });
  });

  it('a soma das linhas é sempre a quantidade', () => {
    for (let n = 1; n <= 10; n++) {
      const r = representarQuantidade(n);
      expect(r.tipo).toBe('bolinhas');
      if (r.tipo === 'bolinhas') {
        expect(r.linhas.reduce((a, b) => a + b, 0)).toBe(n);
        expect(r.linhas.every((l) => l >= 1 && l <= 5)).toBe(true);
      }
    }
  });
});

describe('representacao_quantidade — de 11 a 20: estilo material dourado (D-42)', () => {
  it('14 vira 1 barra de 10 e 4 cubinhos', () => {
    expect(representarQuantidade(14)).toEqual({ tipo: 'dourado', dezenas: 1, unidades: 4 });
  });

  it('11 é 1 barra + 1 cubinho', () => {
    expect(representarQuantidade(11)).toEqual({ tipo: 'dourado', dezenas: 1, unidades: 1 });
  });

  it('20 é 2 barras e nenhum cubinho', () => {
    expect(representarQuantidade(20)).toEqual({ tipo: 'dourado', dezenas: 2, unidades: 0 });
  });

  it('dezenas*10 + unidades é sempre a quantidade', () => {
    for (let n = 11; n <= 20; n++) {
      const r = representarQuantidade(n);
      expect(r.tipo).toBe('dourado');
      if (r.tipo === 'dourado') expect(r.dezenas * 10 + r.unidades).toBe(n);
    }
  });
});

describe('representacao_quantidade — entradas inválidas e grupos (nível 8)', () => {
  it('fora de 1 a 20 ou não inteiro lança erro, nunca desenha quantidade errada', () => {
    for (const n of [0, -3, 21, 2.5, NaN]) {
      expect(() => representarQuantidade(n)).toThrow();
    }
  });

  it('grupos: N grupos de M objetos', () => {
    expect(representarGrupos(3, 4)).toEqual({ tipo: 'grupos', grupos: 3, porGrupo: 4 });
  });

  it('grupos inválidos (zero, negativo, fracionário) lançam erro', () => {
    expect(() => representarGrupos(0, 4)).toThrow();
    expect(() => representarGrupos(3, -1)).toThrow();
    expect(() => representarGrupos(1.5, 2)).toThrow();
  });
});
