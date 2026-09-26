import { tocarLetra } from '../../services/montagem_palavra';

const GATO = ['g', 'a', 't', 'o'];

describe('montagem_palavra — toque numa peça (US1 cenário 5, D-06, D-55)', () => {
  it('letra certa na vez entra na próxima vaga', () => {
    expect(tocarLetra(GATO, [], 'g')).toEqual({
      tipo: 'certo',
      preenchidas: ['g'],
      completa: false,
    });
    expect(tocarLetra(GATO, ['g'], 'a')).toEqual({
      tipo: 'certo',
      preenchidas: ['g', 'a'],
      completa: false,
    });
  });

  it('a última letra certa completa a palavra', () => {
    expect(tocarLetra(GATO, ['g', 'a', 't'], 'o')).toEqual({
      tipo: 'certo',
      preenchidas: ['g', 'a', 't', 'o'],
      completa: true,
    });
  });

  it('letra fora da vez é erro — mesmo sendo uma letra que existe na palavra', () => {
    expect(tocarLetra(GATO, [], 'o')).toEqual({ tipo: 'errado' });
    expect(tocarLetra(GATO, ['g'], 't')).toEqual({ tipo: 'errado' });
  });

  it('não muda o que já estava preenchido (função pura)', () => {
    const preenchidas = ['g'];
    tocarLetra(GATO, preenchidas, 'a');
    expect(preenchidas).toEqual(['g']);
  });

  it('palavra de uma letra só (nível 1) completa no primeiro toque certo', () => {
    expect(tocarLetra(['a'], [], 'a')).toEqual({
      tipo: 'certo',
      preenchidas: ['a'],
      completa: true,
    });
  });

  it('letra repetida na palavra: qualquer peça com a letra certa vale', () => {
    expect(tocarLetra(['b', 'o', 'l', 'a'], ['b'], 'o')).toMatchObject({ tipo: 'certo' });
    expect(tocarLetra(['a', 'v', 'a'], ['a', 'v'], 'a')).toMatchObject({
      tipo: 'certo',
      completa: true,
    });
  });

  it('palavra já completa: qualquer toque extra é erro, nunca estoura', () => {
    expect(tocarLetra(['a'], ['a'], 'a')).toEqual({ tipo: 'errado' });
  });
});
