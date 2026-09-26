import { cor } from '../../theme/tema';
import { razaoDeContraste } from '../../theme/contraste';

const arred = (n: number) => Math.round(n * 100) / 100;

describe('contraste — a tabela do guia "Padrão visual Letra Viva" confere (WCAG, conferida à mão em 2026-09-26)', () => {
  it('razão máxima e mínima', () => {
    expect(razaoDeContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(razaoDeContraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('é simétrica (a ordem dos argumentos não importa)', () => {
    expect(razaoDeContraste(cor.tinta, cor.papel)).toBe(razaoDeContraste(cor.papel, cor.tinta));
  });

  it.each([
    ['tinta sobre papel', cor.tinta, cor.papel, 14.37],
    ['tinta sobre madeira', cor.tinta, cor.madeira, 11.45],
    ['marrom sobre amarelo', cor.amarelo.texto, cor.amarelo.base, 7.53],
    ['branco sobre roxo', cor.roxo.texto, cor.roxo.base, 5.25],
    ['branco sobre azul', cor.azul.texto, cor.azul.base, 5.2],
    ['tinta2 sobre papel', cor.tinta2, cor.papel, 4.94],
    ['branco sobre turquesa', cor.turquesa.texto, cor.turquesa.base, 3.82],
    ['branco sobre vermelho', cor.vermelho.texto, cor.vermelho.base, 3.68],
    ['branco sobre verde', cor.verde.texto, cor.verde.base, 3.47],
  ])('%s', (_nome, texto, fundo, esperado) => {
    expect(arred(razaoDeContraste(texto, fundo))).toBeCloseTo(esperado, 1);
  });
});

describe('contraste — regras do guia que os tokens têm que respeitar', () => {
  it('texto de bloco: nunca abaixo de 3:1 (mínimo pra texto grande em negrito, 24px+)', () => {
    for (const bloco of [cor.vermelho, cor.azul, cor.amarelo, cor.verde, cor.roxo, cor.turquesa]) {
      expect(razaoDeContraste(bloco.texto, bloco.base)).toBeGreaterThanOrEqual(3);
    }
  });

  it('azul, amarelo e roxo passam de 4,5:1 (servem pra qualquer tamanho)', () => {
    for (const bloco of [cor.azul, cor.amarelo, cor.roxo]) {
      expect(razaoDeContraste(bloco.texto, bloco.base)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('branco sobre amarelo é proibido (1,85:1) — por isso o texto do amarelo é marrom', () => {
    expect(razaoDeContraste('#FFFFFF', cor.amarelo.base)).toBeLessThan(3);
    expect(cor.amarelo.texto).not.toBe('#FFFFFF');
  });

  it('A-34: tinta2 só passa de 4,5:1 sobre o papel — sobre papel2 NÃO passa, então lá se usa tinta', () => {
    expect(razaoDeContraste(cor.tinta2, cor.papel)).toBeGreaterThanOrEqual(4.5);
    expect(razaoDeContraste(cor.tinta2, cor.papel2)).toBeLessThan(4.5);
    expect(razaoDeContraste(cor.tinta, cor.papel2)).toBeGreaterThanOrEqual(4.5);
  });

  it('A-34: a palavra oculta ("????") precisa de 3:1 — `grade` (1,2) e `madeiraBorda` (1,8) somem; `tinta2` (4,9) aparece', () => {
    expect(razaoDeContraste(cor.grade, cor.papel)).toBeLessThan(3);
    expect(razaoDeContraste(cor.madeiraBorda, cor.papel)).toBeLessThan(3);
    expect(razaoDeContraste(cor.tinta2, cor.papel)).toBeGreaterThanOrEqual(3);
  });
});
