import { gerarAlternativasLetra } from '../../services/alternativas_letra';

const ALFABETO = 'abcdefghijklmnopqrstuvwxyz'.split('');

describe('alternativas_letra — 4 alternativas sem repetição (FR-006, D-03)', () => {
  it('gera exatamente 4 alternativas', () => {
    const alternativas = gerarAlternativasLetra('a', ALFABETO);
    expect(alternativas).toHaveLength(4);
  });

  it('inclui a letra correta exatamente uma vez', () => {
    const alternativas = gerarAlternativasLetra('m', ALFABETO);
    expect(alternativas.filter((a) => a === 'm')).toHaveLength(1);
  });

  it('nunca repete uma alternativa', () => {
    const alternativas = gerarAlternativasLetra('g', ALFABETO);
    expect(new Set(alternativas).size).toBe(4);
  });

  it('as 3 erradas nunca são a letra correta', () => {
    const alternativas = gerarAlternativasLetra('z', ALFABETO);
    const erradas = alternativas.filter((a) => a !== 'z');
    expect(erradas).toHaveLength(3);
    expect(erradas.every((e) => e !== 'z')).toBe(true);
  });

  it('com a mesma sequência de números aleatórios, o resultado é reproduzível', () => {
    const sequencia = [0.1, 0.9, 0.5, 0.3, 0.7, 0.2, 0.4, 0.6];
    const gerador = () => {
      let i = 0;
      return () => sequencia[i++ % sequencia.length];
    };

    const primeira = gerarAlternativasLetra('a', ALFABETO, gerador());
    const segunda = gerarAlternativasLetra('a', ALFABETO, gerador());

    expect(primeira).toEqual(segunda);
  });

  it('lança erro se não houver letras suficientes pra montar 4 alternativas', () => {
    expect(() => gerarAlternativasLetra('a', ['a', 'b'])).toThrow();
  });
});
