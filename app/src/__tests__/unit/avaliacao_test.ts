import { calcularResultado } from '../../services/avaliacao';

describe('avaliacao — precisão/estrelas (D-06, D-20, FR-007)', () => {
  it('precisão = acertos ÷ tentativas totais (acertos + erros)', () => {
    expect(calcularResultado(8, 2).precisao).toBeCloseTo(0.8);
    expect(calcularResultado(5, 5).precisao).toBeCloseTo(0.5);
    expect(calcularResultado(10, 0).precisao).toBeCloseTo(1);
  });

  it('toda tentativa errada conta como erro — repetir e acertar na 2ª tentativa ainda soma 1 erro (D-06)', () => {
    // acertos=1, erros=1 representa: errou uma vez, acertou na repetição —
    // a rodada nunca "esquece" o erro pra inflar a precisão.
    const resultado = calcularResultado(1, 1);
    expect(resultado.precisao).toBeCloseTo(0.5);
  });

  it('estrelas têm granularidade de meia estrela, proporcional à precisão, máximo 5', () => {
    expect(calcularResultado(10, 0).estrelas).toBe(5); // 100%
    expect(calcularResultado(8, 2).estrelas).toBe(4); // 80%
    expect(calcularResultado(5, 5).estrelas).toBe(2.5); // 50%
    expect(calcularResultado(0, 10).estrelas).toBe(0); // 0%
  });

  it('arredonda pra meia estrela mais próxima quando a precisão não bate exato', () => {
    // 7/10 = 70% -> 3.5 estrelas exato
    expect(calcularResultado(7, 3).estrelas).toBe(3.5);
    // 2/3 = 66.6% -> 3.33 estrelas -> arredonda pra 3.5 (mais próxima)
    expect(calcularResultado(2, 1).estrelas).toBe(3.5);
    // 1/3 = 33.3% -> 1.66 estrelas -> arredonda pra 1.5
    expect(calcularResultado(1, 2).estrelas).toBe(1.5);
  });

  it('sem nenhuma tentativa ainda, precisão e estrelas ficam em zero (não trava, não gera NaN)', () => {
    const resultado = calcularResultado(0, 0);
    expect(resultado.precisao).toBe(0);
    expect(resultado.estrelas).toBe(0);
    expect(Number.isNaN(resultado.precisao)).toBe(false);
  });
});
