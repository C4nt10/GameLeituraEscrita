import { ordemIntercalada } from '../../services/rodada_mista/intercalar';

describe('rodada_mista/intercalar — ordemIntercalada (D-57): leitura e matemática o mais uniforme possível', () => {
  it('contagens iguais, começando por leitura: alterna estrito', () => {
    expect(ordemIntercalada(4, 4, true)).toEqual([
      'leitura',
      'matematica',
      'leitura',
      'matematica',
      'leitura',
      'matematica',
      'leitura',
      'matematica',
    ]);
  });

  it('contagens iguais, começando por matemática: alterna estrito ao contrário', () => {
    expect(ordemIntercalada(2, 2, false)).toEqual([
      'matematica',
      'leitura',
      'matematica',
      'leitura',
    ]);
  });

  it('3 leitura + 2 matemática (tamanho 5, divisão mais justa): nunca 2 do mesmo tipo seguidas quando dá pra evitar', () => {
    const ordem = ordemIntercalada(3, 2, true);
    expect(ordem.filter((t) => t === 'leitura')).toHaveLength(3);
    expect(ordem.filter((t) => t === 'matematica')).toHaveLength(2);
    expect(ordem).toEqual(['leitura', 'matematica', 'leitura', 'matematica', 'leitura']);
  });

  it('1 leitura + 0 matemática: só leitura', () => {
    expect(ordemIntercalada(1, 0, true)).toEqual(['leitura']);
    expect(ordemIntercalada(1, 0, false)).toEqual(['leitura']);
  });

  it('0 leitura + 3 matemática: só matemática', () => {
    expect(ordemIntercalada(0, 3, true)).toEqual(['matematica', 'matematica', 'matematica']);
  });

  it('tamanho total bate sempre com a soma das duas quantidades', () => {
    for (const [l, m] of [
      [4, 4],
      [3, 2],
      [2, 3],
      [5, 3],
      [1, 7],
    ]) {
      expect(ordemIntercalada(l, m, true)).toHaveLength(l + m);
    }
  });
});
